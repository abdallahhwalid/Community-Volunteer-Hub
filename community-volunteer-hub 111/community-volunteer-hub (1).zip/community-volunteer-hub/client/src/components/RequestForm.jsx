import { useState } from "react";

const ALL_CATEGORIES = [
  "Home Tasks", "IT Repair", "Gardening", "Tutoring",
  "Pet Care", "Transportation", "Other",
];

export default function RequestForm() {
  const [form, setForm] = useState({
    title: "", category: "", description: "",
    location: "", desiredDate: "", desiredTime: "",
    flexible: false, requestType: "in-person",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSub] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImage] = useState(null);
  const [imagePreview, setPreview] = useState(null);

  // States required for the External AI API
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);

  const isOnline = form.requestType === "online";

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
    if (key === "description") setAiGenerated(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(e => ({ ...e, image: "Image must be smaller than 5MB" }));
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setErrors(e => ({ ...e, image: "" }));
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required";
    if (!form.category)           e.category    = "Category is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!isOnline && !form.location.trim())
      e.location = "Location is required for in-person requests";
    return e;
  };

  const generateDescription = async () => {
    if (!form.title.trim() || !form.category) {
      setAiError("Please fill in the title and category first.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiGenerated(false);

    try {
      // ✅ Now pointing securely to your proxy-forwarded Express Backend Router
      const response = await fetch("/requests/api/generate-description", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          category: form.category
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAiError(data.message || "External description generation failed.");
        return;
      }

      // Read text safely from your backend's layout signature response
      if (data.description) {
        setForm(f => ({ ...f, description: data.description }));
        setErrors(e => ({ ...e, description: "" }));
        setAiGenerated(true);
      } else {
        setAiError("API answered successfully, but the description field was empty.");
      }
    } catch (err) {
      console.error(err);
      setAiError("An error occurred while communicating with the server.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSub(true);
    try {
      const fd = new FormData();
      fd.append("title",       form.title);
      fd.append("category",    form.category);
      fd.append("description", form.description);
      fd.append("location",    isOnline ? "Online" : form.location);
      fd.append("requestType", isOnline ? "online" : "in-person");
      if (form.desiredDate) fd.append("desiredDate", form.desiredDate);
      if (form.desiredTime) fd.append("desiredTime", form.desiredTime);
      if (form.flexible)    fd.append("flexible", "on");
      if (imageFile)        fd.append("image", imageFile);

      const res = await fetch("/requests", { method: "POST", body: fd });
      if (res.redirected || res.ok) {
        setSuccess(true);
        setTimeout(() => { window.location.href = "/requests"; }, 1800);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } catch {
      setErrors({ general: "Network error. Please try again." });
    }
    setSub(false);
  };

  return (
    <div className="form-box">
      <p className="form-box-title">Request Details</p>
      <p className="form-box-sub">Be as specific as possible to help volunteers understand your needs</p>

      {errors.general && (
        <div style={{ padding:"12px 16px", background:"#FEF2F2", color:"#991B1B",
          border:"1px solid #FECACA", borderRadius:"8px", marginBottom:"16px", fontSize:"14px" }}>
          {errors.general}
        </div>
      )}

      {success && (
        <div style={{ padding:"12px 16px", background:"#F0FDF4", color:"#166534",
          border:"1px solid #BBF7D0", borderRadius:"8px", marginBottom:"16px",
          fontSize:"14px", fontWeight:600 }}>
          ✅ Your request has been posted! Redirecting to browse...
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
        {/* ── REQUEST TYPE ── */}
        <div className="form-group">
          <label>Request Type *</label>
          <div style={{ display:"flex", gap:"12px", marginTop:"4px" }}>
            {[
              { value:"in-person", icon:"📍", label:"In-Person", sub:"Volunteer comes to you or you meet locally" },
              { value:"online",    icon:"🌐", label:"Online", sub:"Help via video call, chat, or remote access" },
            ].map(opt => (
              <label key={opt.value} style={{
                flex:1, display:"flex", alignItems:"center", gap:"10px",
                padding:"12px 16px", borderRadius:"8px", cursor:"pointer",
                border:`2px solid ${form.requestType === opt.value
                  ? (opt.value === "online" ? "#4338CA" : "var(--navy)")
                  : "var(--border)"}`,
                background: form.requestType === opt.value
                  ? (opt.value === "online" ? "#EEF2FF" : "var(--blue-light)")
                  : "white",
                transition:"all 0.2s",
              }}>
                <input type="radio" name="requestType" value={opt.value}
                  checked={form.requestType === opt.value}
                  onChange={() => set("requestType", opt.value)}
                  style={{ accentColor: opt.value === "online" ? "#4338CA" : "var(--navy)" }}
                />
                <span>
                  <span style={{ fontSize:"16px" }}>{opt.icon}</span>
                  <span style={{ fontWeight:600, fontSize:"14px", color:"var(--text-dark)", marginLeft:"6px" }}>{opt.label}</span>
                  <br/>
                  <span style={{ fontSize:"12px", color:"var(--text-gray)" }}>{opt.sub}</span>
                </span>
              </label>
            ))}
          </div>

          {isOnline && (
            <div style={{ marginTop:"10px", padding:"10px 14px", background:"#EEF2FF",
              borderRadius:"8px", fontSize:"13px", color:"#4338CA", fontWeight:500 }}>
              🌐 <strong>Online request</strong> — no physical location needed. Coordinate a video call or chat link via messages.
            </div>
          )}
        </div>

        {/* ── TITLE ── */}
        <div className="form-group">
          <label htmlFor="title">Request Title *</label>
          <input id="title" type="text" className="form-control"
            placeholder="e.g., Need help moving furniture"
            value={form.title} onChange={e => set("title", e.target.value)}
            style={{ borderColor: errors.title ? "#dc2626" : "" }}
          />
          {errors.title && <span className="error-msg show">{errors.title}</span>}
        </div>

        {/* ── CATEGORY ── */}
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select id="category" className="form-control" value={form.category}
            onChange={e => set("category", e.target.value)}
            style={{ borderColor: errors.category ? "#dc2626" : "" }}>
            <option value="">Select a category</option>
            {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <span className="error-msg show">{errors.category}</span>}
        </div>

        {/* ── DESCRIPTION ── */}
        <div className="form-group">
          <div style={{ display:"flex", justifycontent:"space-between", alignItems:"center", marginBottom:"6px" }}>
            <label htmlFor="description" style={{ margin:0 }}>
              Description *
              {aiGenerated && (
                <span style={{
                  marginLeft:"8px", fontSize:"11px", fontWeight:700,
                  background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white",
                  padding:"2px 8px", borderRadius:"99px", verticalAlign:"middle",
                }}>
                  ✨ AI-generated
                </span>
              )}
            </label>

            <button
              type="button"
              onClick={generateDescription}
              disabled={aiLoading}
              style={{
                display:"flex", alignItems:"center", gap:"6px", padding:"7px 14px",
                background: aiLoading ? "#e5e7eb" : "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
                color:  aiLoading ? "#9ca3af" : "white",
                border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:600,
                cursor: aiLoading ? "not-allowed" : "pointer", transition:"all 0.2s",
                boxShadow: aiLoading ? "none" : "0 2px 8px rgba(102,126,234,0.4)", flexShrink:0,
              }}
            >
              {aiLoading ? "⏳ Generating..." : "✨ Generate with AI"}
            </button>
          </div>

          <p style={{ fontSize:"12px", color:"#7c3aed", marginBottom:"8px",
            background:"#faf5ff", padding:"8px 12px", borderRadius:"6px", border:"1px solid #e9d5ff" }}>
            💡 Fill in the <strong>title</strong> and <strong>category</strong> above, then click <strong>Generate with AI</strong> to auto-write a description.
          </p>

          <textarea id="description" className="form-control"
            placeholder="Describe what help you need, any requirements, and what the volunteer can expect..."
            value={form.description}
            onChange={e => set("description", e.target.value)}
            style={{
              borderColor: errors.description ? "#dc2626" : aiGenerated ? "#7c3aed" : "",
              minHeight:"120px",
            }}
          />

          {aiError && (
            <div style={{ marginTop:"6px", padding:"8px 12px", background:"#FEF2F2",
              color:"#991B1B", border:"1px solid #FECACA", borderRadius:"6px", fontSize:"13px" }}>
              ⚠ {aiError}
            </div>
          )}

          {errors.description && <span className="error-msg show">{errors.description}</span>}
        </div>

        {/* ── LOCATION ── */}
        {!isOnline && (
          <div className="form-group">
            <label htmlFor="location">📍 Location *</label>
            <input id="location" type="text" className="form-control"
              placeholder="e.g., Downtown, 123 Main St"
              value={form.location} onChange={e => set("location", e.target.value)}
              style={{ borderColor: errors.location ? "#dc2626" : "" }}
            />
            {errors.location && <span className="error-msg show">{errors.location}</span>}
          </div>
        )}

        {/* ── TIME/DATE ── */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="desiredDate">{isOnline ? "📅 Preferred Meeting Date" : "📅 Desired Date"}</label>
            <input id="desiredDate" type="date" className="form-control"
              value={form.desiredDate} onChange={e => set("desiredDate", e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="desiredTime">{isOnline ? "Preferred Meeting Time" : "Desired Time"}</label>
            <input id="desiredTime" type="time" className="form-control"
              value={form.desiredTime} onChange={e => set("desiredTime", e.target.value)} />
          </div>
        </div>

        {/* ── FLEXIBLE TIME ── */}
        <label className="flexible-check" style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }}>
          <input type="checkbox" style={{ width:"16px", height:"16px" }}
            checked={form.flexible} onChange={e => set("flexible", e.target.checked)} />
          I&apos;m flexible with timing and can coordinate with the volunteer
        </label>

        {/* ── PHOTO UPLOAD ── */}
        <div className="form-group" style={{ marginTop:"16px" }}>
          <label>📷 Add Photo (optional)</label>
          <input type="file" accept="image/*" className="form-control"
            style={{ padding:"8px" }} onChange={handleImageChange} />
          {errors.image && <span className="error-msg show">{errors.image}</span>}
          {imagePreview && (
            <div style={{ marginTop:"12px", position:"relative" }}>
              <img src={imagePreview} alt="Preview" style={{
                width:"100%", maxHeight:"200px", objectFit:"cover", borderRadius:"8px", border:"1px solid #e5e7eb"
              }} />
              <button type="button" onClick={clearImage}
                style={{ display:"block", marginTop:"6px", fontSize:"13px", color:"#dc2626", background:"none", border:"none", cursor:"pointer" }}>
                ✕ Remove photo
              </button>
            </div>
          )}
        </div>

        {/* ── SAFETY ── */}
        <div className="safety-box" style={{ marginTop:"20px" }}>
          <h4>⚠ Safety Reminders</h4>
          <ul>
            {isOnline ? (
              <>
                <li>Never share personal financial information in chat</li>
                <li>Use the platform&apos;s messaging system for communication</li>
                <li>Report any suspicious or inappropriate behavior</li>
              </>
            ) : (
              <>
                <li>Meet in public places when possible</li>
                <li>Verify volunteer identity before sharing personal information</li>
                <li>Trust your instincts and report any suspicious behavior</li>
              </>
            )}
          </ul>
        </div>

        {/* ── ACTIONS ── */}
        <div className="form-actions">
          <a href="/requests" className="btn-secondary">Cancel</a>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Posting..." : "Post Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
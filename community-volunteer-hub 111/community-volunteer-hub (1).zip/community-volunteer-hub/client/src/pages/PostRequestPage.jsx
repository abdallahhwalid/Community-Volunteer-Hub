import { useState, useEffect } from "react";

const ALL_CATEGORIES = ["Home Tasks", "IT Repair", "Gardening", "Tutoring", "Pet Care", "Transportation", "Other"];

export default function PostRequestPage() {
  const [form, setForm] = useState({
    title: "", category: "", description: "",
    location: "", desiredDate: "", desiredTime: "", flexible: false,
    requestType: "in-person", // NEW: explicit toggle
  });
  const [errors, setErrors]     = useState({});
  const [submitting, setSub]    = useState(false);
  const [success, setSuccess]   = useState(false);
  const [imageFile, setImage]   = useState(null);
  const [imagePreview, setPreview] = useState(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => { if (!d.success) window.location.href = "/login"; })
      .catch(() => { window.location.href = "/login"; });
  }, []);

  const isOnline = form.requestType === "online";

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
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

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required";
    if (!form.category)            e.category    = "Category is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!isOnline && !form.location.trim()) e.location = "Location is required for in-person requests";
    return e;
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
    <main className="main-content">
      <div className="form-page">
        <div className="form-page-header">
          <h1>Post a Help Request</h1>
          <p>Describe what you need help with and our volunteers will reach out</p>
        </div>

        <div className="form-box">
          <p className="form-box-title">Request Details</p>
          <p className="form-box-sub">Be as specific as possible to help volunteers understand your needs</p>

          {errors.general && (
            <div style={{ padding:"12px 16px", background:"#FEF2F2", color:"#991B1B", border:"1px solid #FECACA", borderRadius:"8px", marginBottom:"16px", fontSize:"14px" }}>{errors.general}</div>
          )}

          {success && (
            <div style={{ padding:"12px 16px", background:"#F0FDF4", color:"#166534", border:"1px solid #BBF7D0", borderRadius:"8px", marginBottom:"16px", fontSize:"14px", fontWeight:600 }}>✅ Your request has been posted! Redirecting to browse...</div>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>

            {/* ── REQUEST TYPE TOGGLE ── */}
            <div className="form-group">
              <label>Request Type *</label>
              <div style={{ display:"flex", gap:"12px", marginTop:"4px" }}>
                <label style={{
                  flex:1, display:"flex", alignItems:"center", gap:"10px",
                  padding:"12px 16px", borderRadius:"8px", cursor:"pointer",
                  border: `2px solid ${!isOnline ? "var(--navy)" : "var(--border)"}`,
                  background: !isOnline ? "var(--blue-light)" : "white",
                  transition:"all 0.2s"
                }}>
                  <input
                    type="radio" name="requestType" value="in-person"
                    checked={!isOnline}
                    onChange={() => set("requestType", "in-person")}
                    style={{ accentColor:"var(--navy)" }}
                  />
                  <span>
                    <span style={{ fontSize:"16px" }}>📍</span>
                    <span style={{ fontWeight:600, fontSize:"14px", color:"var(--text-dark)", marginLeft:"6px" }}>In-Person</span>
                    <br/>
                    <span style={{ fontSize:"12px", color:"var(--text-gray)" }}>Volunteer comes to you or you meet locally</span>
                  </span>
                </label>

                <label style={{
                  flex:1, display:"flex", alignItems:"center", gap:"10px",
                  padding:"12px 16px", borderRadius:"8px", cursor:"pointer",
                  border: `2px solid ${isOnline ? "#4338CA" : "var(--border)"}`,
                  background: isOnline ? "#EEF2FF" : "white",
                  transition:"all 0.2s"
                }}>
                  <input
                    type="radio" name="requestType" value="online"
                    checked={isOnline}
                    onChange={() => set("requestType", "online")}
                    style={{ accentColor:"#4338CA" }}
                  />
                  <span>
                    <span style={{ fontSize:"16px" }}>🌐</span>
                    <span style={{ fontWeight:600, fontSize:"14px", color:"var(--text-dark)", marginLeft:"6px" }}>Online</span>
                    <br/>
                    <span style={{ fontSize:"12px", color:"var(--text-gray)" }}>Help via video call, chat, or remote access</span>
                  </span>
                </label>
              </div>

              {isOnline && (
                <div style={{ marginTop:"10px", padding:"10px 14px", background:"#EEF2FF", borderRadius:"8px", fontSize:"13px", color:"#4338CA", fontWeight:500 }}>
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
                style={{ borderColor: errors.title ? "#dc2626" : "" }} />
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
              <label htmlFor="description">Description *</label>
              <textarea id="description" className="form-control"
                placeholder="Provide detailed information about what you need help with..."
                value={form.description} onChange={e => set("description", e.target.value)}
                style={{ borderColor: errors.description ? "#dc2626" : "" }} />
              <p style={{ fontSize:"12px", color:"var(--text-gray)", marginTop:"6px" }}>
                Include important details like the scope of work and any special requirements
              </p>
              {errors.description && <span className="error-msg show">{errors.description}</span>}
            </div>

            {/* ── LOCATION (hidden when online) ── */}
            {!isOnline && (
              <div className="form-group">
                <label htmlFor="location">📍 Location *</label>
                <input id="location" type="text" className="form-control"
                  placeholder="e.g., Downtown, 123 Main St"
                  value={form.location} onChange={e => set("location", e.target.value)}
                  style={{ borderColor: errors.location ? "#dc2626" : "" }} />
                {errors.location && <span className="error-msg show">{errors.location}</span>}
              </div>
            )}

            {/* ── DATE & TIME ── */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="desiredDate">
                  {isOnline ? "📅 Preferred Meeting Date" : "📅 Desired Date"}
                </label>
                <input id="desiredDate" type="date" className="form-control"
                  value={form.desiredDate} onChange={e => set("desiredDate", e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="desiredTime">
                  {isOnline ? "Preferred Meeting Time" : "Desired Time"}
                </label>
                <input id="desiredTime" type="time" className="form-control"
                  value={form.desiredTime} onChange={e => set("desiredTime", e.target.value)} />
              </div>
            </div>

            {/* ── FLEXIBLE ── */}
            <label className="flexible-check" style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }}>
              <input type="checkbox" style={{ width:"16px", height:"16px" }}
                checked={form.flexible} onChange={e => set("flexible", e.target.checked)} />
              I&apos;m flexible with timing and can coordinate with the volunteer
            </label>

            {/* ── PHOTO (only for in-person) ── */}
            {!isOnline && (
              <div className="form-group" style={{ marginTop:"16px" }}>
                <label>📷 Add Photo (optional)</label>
                <input type="file" accept="image/*" className="form-control"
                  style={{ padding:"8px" }} onChange={handleImageChange} />
                {errors.image && <span className="error-msg show">{errors.image}</span>}
                {imagePreview && (
                  <img src={imagePreview} alt="Preview"
                    style={{ marginTop:"10px", width:"100%", maxHeight:"200px", objectFit:"cover", borderRadius:"8px" }}/>
                )}
              </div>
            )}

            {/* ── SAFETY BOX ── */}
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

            <div className="form-actions">
              <a href="/requests" className="btn-secondary">Cancel</a>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Posting..." : "Post Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
import { useState, useEffect, useCallback } from "react";

const OUTDOOR_CATEGORIES = ["Home Tasks", "Gardening", "Transportation", "Pet Care"];

export default function RequestsPage() {
  const [requests, setRequests]         = useState([]);
  const [filters, setFilters]           = useState({ search: "", category: "", status: "" });
  const [loading, setLoading]           = useState(true);
  const [user, setUser]                 = useState(null);
  const [selectedRequest, setSelected] = useState(null);
  const [suggestedTime, setSuggestedTime] = useState("");
  const [timeError, setTimeError]       = useState("");
  const [offerStatus, setOfferStatus]   = useState(null);
  const [sendingOffer, setSendingOffer] = useState(false);
  const [weather, setWeather]           = useState(null);
  const [weatherLoading, setWxLoading] = useState(false);
  const [loginPrompt, setLoginPrompt]   = useState(false);

  // ── Fetch requests from API ──
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search)   params.set("search",   filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.status)   params.set("status",   filters.status);
    try {
      const res  = await fetch(`/requests/api?${params}`);
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch { /* network err */ }
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.user); })
      .catch(() => {});
  }, []);

  // ── Weather via Open-Meteo (free, no API key) ──
  const fetchWeather = async (location) => {
    if (!OUTDOOR_CATEGORIES.includes(selectedRequest?.category)) return;
    setWxLoading(true);
    setWeather(null);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();
      if (!geoData.results?.length) { setWxLoading(false); return; }
      const { latitude, longitude, name } = geoData.results[0];
      const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m,windspeed_10m`
      );
      const wxData = await wxRes.json();
      const cw = wxData.current_weather;
      setWeather({
        temp: Math.round(cw.temperature),
        wind: Math.round(cw.windspeed),
        city: name,
        code: cw.weathercode,
      });
    } catch { /* weather unavailable */ }
    setWxLoading(false);
  };

  const weatherEmoji = (code) => {
    if (code === 0) return "☀️";
    if (code <= 3)  return "⛅";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    return "🌩️";
  };

  const openModal = (req) => {
    if (!user) { setLoginPrompt(true); return; }
    setSelected(req);
    setSuggestedTime("");
    setTimeError("");
    setOfferStatus(null);
    setWeather(null);
    if (!isOnline(req)) fetchWeather(req.location);
  };

  const closeModal = () => {
    setSelected(null);
    setWeather(null);
    setSuggestedTime("");
    setTimeError("");
    setOfferStatus(null);
  };

  // ── Date/time validation ──
  const validateTime = (val) => {
    if (!val) {
      setTimeError("Please select a date and time.");
      return false;
    }
    if (new Date(val) <= new Date()) {
      setTimeError("Please select a future date and time.");
      return false;
    }
    setTimeError("");
    return true;
  };

  const handleTimeChange = (val) => {
    setSuggestedTime(val);
    if (val) validateTime(val); // live validation
  };

  const confirmHelp = async () => {
    if (!validateTime(suggestedTime)) return;

    setSendingOffer(true);
    setOfferStatus(null);
    try {
      const res  = await fetch(`/requests/${selectedRequest._id}/offer`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestedTime }),
      });
      const data = await res.json();
      if (data.success) {
        setOfferStatus({ type: "success", msg: "✓ Offer sent! Redirecting to messages..." });
        setTimeout(() => {
          closeModal();
          window.location.href = "/messages";
        }, 1400);
      } else {
        setOfferStatus({ type: "error", msg: data.message });
      }
    } catch {
      setOfferStatus({ type: "error", msg: "Network error. Please try again." });
    }
    setSendingOffer(false);
  };

  const isOnline = (req) =>
    req && (req.requestType === "online" || req.location === "Online");

  const badgeClass = (status) =>
    status === "Open"        ? "badge-open"      :
    status === "In Progress" ? "badge-progress"  : "badge-completed";

  // Min datetime = now (for the picker)
  const nowLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const filtered = requests.filter(r => {
    const s = filters.search.toLowerCase();
    return (
      (!s || r.title.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s)) &&
      (!filters.category || r.category === filters.category) &&
      (!filters.status   || r.status === filters.status)
    );
  });

  return (
    <>
      <main className="main-content">
        <div className="page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h1>Browse Help Requests</h1>
            <p>Find opportunities to help people in your community</p>
          </div>
          <a href="/requests/new" className="btn-primary">+ Post a Request</a>
        </div>

        <div className="section" style={{ paddingTop:"32px" }}>

          {/* ── FILTERS ── */}
          <div className="filters-bar">
            <div className="search-wrap">
              <span className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text" className="search-input" placeholder="Search requests..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>

            <select className="filter-select" value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {["Home Tasks","IT Repair","Gardening","Tutoring","Pet Care","Transportation","Other"]
                .map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select className="filter-select" value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          <p style={{ fontSize:"14px", color:"var(--text-gray)", marginBottom:"20px" }}>
            Showing {filtered.length} request{filtered.length !== 1 ? "s" : ""}
          </p>

          {/* ── CARDS ── */}
          {loading ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-gray)" }}>
              Loading requests...
            </div>
          ) : filtered.length === 0 ? (
            <p style={{ color:"var(--text-gray)", padding:"24px 0" }}>
              No requests found. Try adjusting your filters.
            </p>
          ) : (
            <div className="requests-grid">
              {filtered.map(req => {
                const online   = isOnline(req);
                const isOwner  = user && req.postedBy && (req.postedBy._id || req.postedBy) === user._id;
                const inProgress = req.status === "In Progress";

                return (
                  <div key={req._id} className="req-card">
                    <div className="req-card-top">
                      <span className={`badge ${badgeClass(req.status)}`}>{req.status}</span>
                      <span className="req-time">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Online / In-person tag */}
                    <span style={{
                      display:"inline-block", fontSize:"11px", fontWeight:700,
                      background: online ? "#EEF2FF" : "#D1FAE5",
                      color: online ? "#4338CA" : "#065F46",
                      border: `1px solid ${online ? "#C7D2FE" : "#6EE7B7"}`,
                      borderRadius:"6px", padding:"2px 8px", marginBottom:"6px"
                    }}>
                      {online ? "🌐 Online" : "📍 In-Person"}
                    </span>

                    {req.image && (
                      <img src={req.image} alt="Request"
                        style={{ width:"100%", height:"140px", objectFit:"cover", borderRadius:"8px", marginBottom:"10px" }}
                      />
                    )}

                    <h3>{req.title}</h3>
                    <p className="req-category">{req.category}</p>
                    <p className="req-desc">{req.description?.substring(0, 100)}...</p>

                    <div className="req-meta">
                      {online
                        ? <span className="meta-info">🌐 Online Meeting</span>
                        : <span className="meta-info">📍 {req.location}</span>
                      }
                      {req.desiredDate
                        ? <span className="meta-info">🕐 {new Date(req.desiredDate).toDateString()}</span>
                        : <span className="meta-info">🕐 Flexible</span>
                      }
                    </div>

                    {/* ── Offer button logic ── */}
                    {inProgress ? (
                      <button className="btn-offer" disabled
                        style={{ background:"#e5e7eb", color:"#9ca3af", cursor:"not-allowed" }}>
                        🔄 In Progress
                      </button>
                    ) : isOwner ? (
                      <button className="btn-offer" disabled
                        style={{ background:"#e5e7eb", color:"#9ca3af", cursor:"not-allowed" }}>
                        Your Request
                      </button>
                    ) : (
                      <button className="btn-offer" onClick={() => openModal(req)}>
                        Offer Help
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── LOGIN PROMPT ── */}
      {loginPrompt && (
        <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(15,23,42,0.5)",
          backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
          onClick={() => setLoginPrompt(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:"16px",
            padding:"32px 28px", maxWidth:"360px", width:"100%", textAlign:"center",
            boxShadow:"0 20px 50px rgba(0,0,0,0.18)" }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"#EEF2FF",
              display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:"24px" }}>
              🔒
            </div>
            <h3 style={{ fontSize:"18px", fontWeight:700, color:"#111827", margin:"0 0 8px" }}>Login Required</h3>
            <p style={{ fontSize:"14px", color:"#6b7280", lineHeight:1.6, margin:"0 0 24px" }}>
              You need to be logged in to offer help.
            </p>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => setLoginPrompt(false)}
                style={{ flex:1, padding:"11px 0", borderRadius:"10px", fontSize:"14px", fontWeight:600,
                  cursor:"pointer", background:"#f3f4f6", color:"#374151", border:"1.5px solid #e5e7eb" }}>
                Cancel
              </button>
              <button onClick={() => window.location.href = "/login"}
                style={{ flex:1, padding:"11px 0", borderRadius:"10px", fontSize:"14px", fontWeight:600,
                  cursor:"pointer", background:"#1E3A8A", color:"#fff", border:"none" }}>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── OFFER MODAL ── */}
      {selectedRequest && (
        <div className="modal-overlay" style={{ display:"flex" }} onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}
            style={{ maxHeight:"90vh", overflowY:"auto" }}>

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"4px" }}>
              <div>
                <h2 style={{ marginBottom:"4px" }}>{selectedRequest.title}</h2>
                <p className="modal-cat">{selectedRequest.category}</p>
              </div>
              <span style={{
                fontSize:"12px", fontWeight:700, borderRadius:"8px", padding:"4px 10px", whiteSpace:"nowrap",
                background: isOnline(selectedRequest) ? "#EEF2FF" : "#D1FAE5",
                color:      isOnline(selectedRequest) ? "#4338CA" : "#065F46",
              }}>
                {isOnline(selectedRequest) ? "🌐 Online" : "📍 In-Person"}
              </span>
            </div>

            {/* Location / format */}
            <div className="modal-grid">
              <div className="modal-item">
                <label>{isOnline(selectedRequest) ? "Format" : "Location"}</label>
                <p>{isOnline(selectedRequest) ? "Online Meeting (video/call)" : selectedRequest.location}</p>
              </div>
              {selectedRequest.desiredDate && (
                <div className="modal-item">
                  <label>Requested Date</label>
                  <p>{new Date(selectedRequest.desiredDate).toDateString()}</p>
                </div>
              )}
            </div>

            {/* Weather (outdoor only) */}
            {!isOnline(selectedRequest) && OUTDOOR_CATEGORIES.includes(selectedRequest.category) && (
              <div style={{ margin:"12px 0", padding:"12px 14px", borderRadius:"10px",
                background:"#F0F9FF", border:"1px solid #BAE6FD", display:"flex", alignItems:"center", gap:"10px" }}>
                {weatherLoading ? (
                  <span style={{ fontSize:"13px", color:"#0369A1" }}>⏳ Fetching local weather...</span>
                ) : weather ? (
                  <div>
                    <p style={{ fontWeight:700, fontSize:"14px", margin:0, color:"#0C4A6E" }}>
                      {weatherEmoji(weather.code)} {weather.city} — {weather.temp}°C
                    </p>
                    <p style={{ fontSize:"12px", color:"#0369A1", margin:"2px 0 0" }}>
                      Wind {weather.wind} km/h
                    </p>
                  </div>
                ) : (
                  <span style={{ fontSize:"13px", color:"#0369A1" }}>🌤 Weather unavailable for this location</span>
                )}
              </div>
            )}

            {/* Requested by */}
            <div className="modal-section">
              <label>Requested by</label>
              <div className="user-info">
                <span>{selectedRequest.postedBy?.name || "Unknown"}</span>
              </div>
            </div>

            {/* Time picker with validation */}
            <div className="modal-section time-picker-box">
              <label>
                {isOnline(selectedRequest) ? "📅 Schedule Online Meeting Time" : "Set your convenient time"}
              </label>
              {isOnline(selectedRequest) && (
                <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"8px" }}>
                  Pick a time and coordinate the meeting link via messages.
                </p>
              )}
              <input
                type="datetime-local"
                className="form-control"
                value={suggestedTime}
                min={nowLocal()}
                onChange={e => handleTimeChange(e.target.value)}
                style={{ borderColor: timeError ? "#dc2626" : "" }}
              />
              {timeError && (
                <span style={{ color:"#dc2626", fontSize:"12px", marginTop:"4px", display:"block" }}>
                  ⚠ {timeError}
                </span>
              )}
            </div>

            {/* Offer status message */}
            {offerStatus && (
              <div style={{ marginTop:"10px", fontSize:"14px", padding:"10px 14px", borderRadius:"8px",
                background: offerStatus.type === "success" ? "#F0FDF4" : "#FEF2F2",
                color:      offerStatus.type === "success" ? "#166534"  : "#991B1B",
                border: `1px solid ${offerStatus.type === "success" ? "#BBF7D0" : "#FECACA"}` }}>
                {offerStatus.msg}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button
                className="btn-primary"
                onClick={confirmHelp}
                disabled={sendingOffer || !suggestedTime}
              >
                {sendingOffer ? "Sending..." : isOnline(selectedRequest) ? "📅 Schedule Meeting" : "Contact to Help"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
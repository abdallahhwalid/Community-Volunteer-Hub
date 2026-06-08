import { useState, useEffect, useCallback } from "react";
import MapView from "../components/MapView";
import FilterBar from "../components/FilterBar";
 
const OUTDOOR_CATEGORIES = ["Home Tasks", "Gardening", "Transportation", "Pet Care"];
 
export default function RequestsPage() {
  const [requests, setRequests]           = useState([]);
 
  const [filters, setFilters]             = useState({ search: "", category: "", status: "", requestType: "" });
  const [loading, setLoading]             = useState(true);
  const [user, setUser]                   = useState(null);
  const [selectedRequest, setSelected]    = useState(null);
  const [suggestedTime, setSuggestedTime] = useState("");
  const [timeError, setTimeError]         = useState("");
  const [offerStatus, setOfferStatus]     = useState(null);
  const [sendingOffer, setSendingOffer]   = useState(false);
  const [weather, setWeather]             = useState(null);
  const [weatherLoading, setWxLoading]    = useState(false);
  const [loginPrompt, setLoginPrompt]     = useState(false);
  const [showMap, setShowMap]             = useState(false);
 
  
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search)   params.set("search",   filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.status)   params.set("status",   filters.status);
    try {
      const res  = await fetch(`http://localhost:3000/requests/api?${params}`);
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
 

  const fetchWeather = async (location) => {
    if (!OUTDOOR_CATEGORIES.includes(selectedRequest?.category)) return;
    setWxLoading(true);
    setWeather(null);
    try {
      const geoRes  = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();
      if (!geoData.results?.length) { setWxLoading(false); return; }
      const { latitude, longitude, name } = geoData.results[0];
      const wxRes  = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const wxData = await wxRes.json();
      const cw     = wxData.current_weather;
      setWeather({ temp: Math.round(cw.temperature), wind: Math.round(cw.windspeed), city: name, code: cw.weathercode });
    } catch { /* weather unavailable */ }
    setWxLoading(false);
  };
 
  const weatherEmoji = (code) => {
    if (code === 0)  return "☀️";
    if (code <= 3)   return "⛅";
    if (code <= 67)  return "🌧️";
    if (code <= 77)  return "❄️";
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
 
  const validateTime = (val) => {
    if (!val)                         { setTimeError("Please select a date and time.");        return false; }
    if (new Date(val) <= new Date())  { setTimeError("Please select a future date and time."); return false; }
    setTimeError("");
    return true;
  };
 
  const handleTimeChange = (val) => {
    setSuggestedTime(val);
    if (val) validateTime(val);
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
        setTimeout(() => { closeModal(); window.location.href = "/messages"; }, 1400);
      } else {
        setOfferStatus({ type: "error", msg: data.message });
      }
    } catch {
      setOfferStatus({ type: "error", msg: "Network error. Please try again." });
    }
    setSendingOffer(false);
  };
 
  const isOnline    = (req) => req && (req.requestType === "online" || req.location === "Online");
  const badgeClass  = (status) =>
    status === "Open"        ? "badge-open"     :
    status === "In Progress" ? "badge-progress" : "badge-completed";
 
  const nowLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
 
  
  const filtered = requests.filter(r => {
    const s = filters.search.toLowerCase();
    const reqIsOnline = r.requestType === "online" || r.location === "Online";
    const typeMatch =
      !filters.requestType ||
      (filters.requestType === "online"    &&  reqIsOnline) ||
      (filters.requestType === "in-person" && !reqIsOnline);
    return (
      (!s || r.title.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s)) &&
      (!filters.category || r.category === filters.category) &&
      (!filters.status   || r.status   === filters.status)   &&
      typeMatch
    );
  });
 
  
  const mappableRequests = filtered.filter(r => !isOnline(r));
 
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
 
  
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
            <FilterBar
              filters={filters}
              onFilterChange={(key, value) => setFilters(f => ({ ...f, [key]: value }))}
            />
 
            <div style={{
              display:"flex", border:"1.5px solid var(--border)", borderRadius:"8px",
              overflow:"hidden", marginLeft:"auto", flexShrink:0,
            }}>
              <button
                onClick={() => setShowMap(false)}
                style={{
                  padding:"9px 16px", border:"none", cursor:"pointer",
                  fontSize:"13px", fontWeight:600, transition:"all 0.2s",
                  background: !showMap ? "var(--navy)" : "white",
                  color:      !showMap ? "white"      : "var(--text-mid)",
                  display:"flex", alignItems:"center", gap:"6px",
                }}
              >
                ▦ Grid
              </button>
              <button
                onClick={() => setShowMap(true)}
                style={{
                  padding:"9px 16px", border:"none", borderLeft:"1.5px solid var(--border)",
                  cursor:"pointer", fontSize:"13px", fontWeight:600, transition:"all 0.2s",
                  background: showMap ? "var(--navy)" : "white",
                  color:      showMap ? "white"      : "var(--text-mid)",
                  display:"flex", alignItems:"center", gap:"6px",
                }}
              >
                🗺️ Map
              </button>
            </div>
          </div>
 
          <p style={{ fontSize:"14px", color:"var(--text-gray)", marginBottom:"20px" }}>
            Showing {filtered.length} request{filtered.length !== 1 ? "s" : ""}
            {showMap && mappableRequests.length < filtered.length && (
              <span style={{ marginLeft:"8px", color:"#4338CA", fontSize:"13px" }}>
                ({filtered.length - mappableRequests.length} online — not shown on map)
              </span>
            )}
          </p>
 
          
          {showMap && (
            <div style={{ marginBottom:"32px" }}>
              {loading ? (
                <div style={{ height:"420px", display:"flex", alignItems:"center", justifyContent:"center",
                  background:"#f9fafb", borderRadius:"16px", border:"1px solid var(--border)",
                  color:"var(--text-gray)", fontSize:"15px" }}>
                  Loading map...
                </div>
              ) : mappableRequests.length === 0 ? (
                <div style={{ height:"280px", display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", background:"#f9fafb", borderRadius:"16px",
                  border:"1px solid var(--border)", color:"var(--text-gray)", gap:"8px" }}>
                  <span style={{ fontSize:"40px", opacity:0.4 }}>🗺️</span>
                  <p style={{ fontSize:"15px", margin:0 }}>No in-person requests to show on the map.</p>
                </div>
              ) : (
                <MapView
                  requests={mappableRequests}
                  height="460px"
                  onMarkerClick={(req) => openModal(req)}
                />
              )}
 
              {!loading && mappableRequests.length > 0 && (
                <div style={{ marginTop:"24px" }}>
                  <h3 style={{ fontSize:"15px", fontWeight:700, marginBottom:"12px", color:"var(--text-dark)" }}>
                    📍 In-Person Requests on Map
                  </h3>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"12px" }}>
                    {mappableRequests.map(req => (
                      <div key={req._id} style={{
                        background:"white", border:"1px solid var(--border)", borderRadius:"10px",
                        padding:"14px 16px", display:"flex", justifyContent:"space-between",
                        alignItems:"center", gap:"12px",
                      }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontWeight:700, fontSize:"14px", margin:"0 0 2px",
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {req.title}
                          </p>
                          <p style={{ fontSize:"12px", color:"var(--text-gray)", margin:0 }}>
                            📍 {req.location} · {req.category}
                          </p>
                        </div>
                        {req.status === "Open" ? (
                          <button
                            className="btn-blue"
                            style={{ fontSize:"12px", padding:"6px 12px", whiteSpace:"nowrap", flexShrink:0 }}
                            onClick={() => openModal(req)}
                          >
                            Offer Help
                          </button>
                        ) : (
                          <span className={`badge ${badgeClass(req.status)}`} style={{ flexShrink:0 }}>
                            {req.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
 
          
          {!showMap && (
            loading ? (
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
                  const online     = isOnline(req);
                  const isOwner    = user && req.postedBy &&
                    (req.postedBy._id || req.postedBy) === user._id;
                  const inProgress = req.status === "In Progress";
 
                  return (
                    <div key={req._id} className="req-card">
                      <div className="req-card-top">
                        <span className={`badge ${badgeClass(req.status)}`}>{req.status}</span>
                        <span className="req-time">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
 
                      <span style={{
                        display:"inline-block", fontSize:"11px", fontWeight:700,
                        background: online ? "#EEF2FF" : "#D1FAE5",
                        color:      online ? "#4338CA" : "#065F46",
                        border:     `1px solid ${online ? "#C7D2FE" : "#6EE7B7"}`,
                        borderRadius:"6px", padding:"2px 8px", marginBottom:"6px",
                      }}>
                        {online ? "🌐 Online" : "📍 In-Person"}
                      </span>
 
                      {req.image && (
                        <img src={req.image} alt="Request"
                          style={{ width:"100%", height:"140px", objectFit:"cover",
                            borderRadius:"8px", marginBottom:"10px" }}
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
            )
          )}
        </div>
      </main>
 
      
      {loginPrompt && (
        <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(15,23,42,0.5)",
          backdropFilter:"blur(4px)", display:"flex", alignItems:"center",
          justifyContent:"center", padding:"20px" }}
          onClick={() => setLoginPrompt(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:"16px",
            padding:"32px 28px", maxWidth:"360px", width:"100%", textAlign:"center",
            boxShadow:"0 20px 50px rgba(0,0,0,0.18)" }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"#EEF2FF",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 16px", fontSize:"24px" }}>🔒</div>
            <h3 style={{ fontSize:"18px", fontWeight:700, color:"#111827", margin:"0 0 8px" }}>
              Login Required
            </h3>
            <p style={{ fontSize:"14px", color:"#6b7280", lineHeight:1.6, margin:"0 0 24px" }}>
              You need to be logged in to offer help.
            </p>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => setLoginPrompt(false)} style={{ flex:1, padding:"11px 0",
                borderRadius:"10px", fontSize:"14px", fontWeight:600, cursor:"pointer",
                background:"#f3f4f6", color:"#374151", border:"1.5px solid #e5e7eb" }}>
                Cancel
              </button>
              <button onClick={() => window.location.href = "/login"} style={{ flex:1, padding:"11px 0",
                borderRadius:"10px", fontSize:"14px", fontWeight:600, cursor:"pointer",
                background:"#1E3A8A", color:"#fff", border:"none" }}>
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
 
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start", marginBottom:"4px" }}>
              <div>
                <h2 style={{ marginBottom:"4px" }}>{selectedRequest.title}</h2>
                <p className="modal-cat">{selectedRequest.category}</p>
              </div>
              <span style={{
                fontSize:"12px", fontWeight:700, borderRadius:"8px",
                padding:"4px 10px", whiteSpace:"nowrap",
                background: isOnline(selectedRequest) ? "#EEF2FF" : "#D1FAE5",
                color:      isOnline(selectedRequest) ? "#4338CA" : "#065F46",
              }}>
                {isOnline(selectedRequest) ? "🌐 Online" : "📍 In-Person"}
              </span>
            </div>
 
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
 
            {/* Weather widget (outdoor in-person only) */}
            {!isOnline(selectedRequest) &&
              OUTDOOR_CATEGORIES.includes(selectedRequest.category) && (
              <div style={{ margin:"12px 0", padding:"12px 14px", borderRadius:"10px",
                background:"#F0F9FF", border:"1px solid #BAE6FD",
                display:"flex", alignItems:"center", gap:"10px" }}>
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
                  <span style={{ fontSize:"13px", color:"#0369A1" }}>
                    🌤 Weather unavailable for this location
                  </span>
                )}
              </div>
            )}
 
            <div className="modal-section">
              <label>Requested by</label>
              <div className="user-info">
                <span>{selectedRequest.postedBy?.name || "Unknown"}</span>
              </div>
            </div>
 
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
 
            {offerStatus && (
              <div style={{ marginTop:"10px", fontSize:"14px", padding:"10px 14px",
                borderRadius:"8px",
                background: offerStatus.type === "success" ? "#F0FDF4" : "#FEF2F2",
                color:      offerStatus.type === "success" ? "#166534"  : "#991B1B",
                border:`1px solid ${offerStatus.type === "success" ? "#BBF7D0" : "#FECACA"}` }}>
                {offerStatus.msg}
              </div>
            )}
 
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={confirmHelp}
                disabled={sendingOffer || !suggestedTime}>
                {sendingOffer
                  ? "Sending..."
                  : isOnline(selectedRequest)
                  ? "📅 Schedule Meeting"
                  : "Contact to Help"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
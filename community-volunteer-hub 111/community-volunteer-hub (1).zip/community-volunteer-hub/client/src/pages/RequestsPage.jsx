import { useState, useEffect, useCallback } from "react";
 
const WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your key
const OUTDOOR_CATEGORIES = ["Home Tasks", "Gardening", "Transportation", "Pet Care"];
 
export default function RequestsPage() {
  const [requests, setRequests]       = useState([]);
  const [filters, setFilters]         = useState({ search: "", category: "", status: "" });
  const [loading, setLoading]         = useState(true);
  const [user, setUser]               = useState(null);
  const [selectedRequest, setSelected] = useState(null);
  const [suggestedTime, setSuggestedTime] = useState("");
  const [offerStatus, setOfferStatus] = useState(null); 
  const [sendingOffer, setSendingOffer] = useState(false);
  const [weather, setWeather]         = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
 
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
 
  const fetchWeather = async (location) => {
    if (!OUTDOOR_CATEGORIES.some(c => selectedRequest?.category === c)) return;
    setWeatherLoading(true);
    setWeather(null);
    try {
      const geo = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${WEATHER_API_KEY}`
      ).then(r => r.json());
      if (!geo.length) { setWeatherLoading(false); return; }
      const { lat, lon } = geo[0];
      const wx = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
      ).then(r => r.json());
      setWeather({
        temp: Math.round(wx.main.temp),
        feels: Math.round(wx.main.feels_like),
        desc: wx.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${wx.weather[0].icon}@2x.png`,
        wind: Math.round(wx.wind.speed * 3.6), 
        humidity: wx.main.humidity,
        city: wx.name,
      });
    } catch { }
    setWeatherLoading(false);
  };
 
  const openModal = (req) => {
    if (!user) { setLoginPrompt(true); return; }
    setSelected(req);
    setSuggestedTime("");
    setOfferStatus(null);
    fetchWeather(req.location);
  };
 
  const closeModal = () => {
    setSelected(null);
    setWeather(null);
    setSuggestedTime("");
    setOfferStatus(null);
  };
 
  const confirmHelp = async () => {
    if (!suggestedTime) return;
    setSendingOffer(true);
    setOfferStatus(null);
    try {
      const res  = await fetch(`/requests/${selectedRequest._id}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestedTime }),
      });
      const data = await res.json();
      if (data.success) {
        setOfferStatus({ type: "success", msg: "✓ Offer sent! Redirecting to messages..." });
        setTimeout(() => {
          closeModal();
          const q = new URLSearchParams({
            autoMsg: "true",
            datetime: suggestedTime,
            user: selectedRequest.postedBy?.name || "",
            requestTitle: selectedRequest.title,
          });
          window.location.href = `/messages?${q}`;
        }, 1400);
      } else {
        setOfferStatus({ type: "error", msg: data.message });
      }
    } catch {
      setOfferStatus({ type: "error", msg: "Network error. Please try again." });
    }
    setSendingOffer(false);
  };
 
  const isOnline = (req) => req && ["IT Repair", "Tutoring"].includes(req.category);
  const badgeClass = (status) => status === "Open" ? "badge-open" : status === "In Progress" ? "badge-progress" : "badge-completed";
 
  const filtered = requests.filter(r => {
    const s = filters.search.toLowerCase();
    return (
      (!s || r.title.toLowerCase().includes(s) || r.description.toLowerCase().includes(s)) &&
      (!filters.category || r.category === filters.category) &&
      (!filters.status || r.status === filters.status)
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
          <div className="filters-bar">
            <div className="search-wrap">
              <span className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input type="text" className="search-input" placeholder="Search requests..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
            </div>
 
            <select className="filter-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {["Home Tasks","IT Repair","Gardening","Tutoring","Pet Care","Transportation","Other"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
 
            <select className="filter-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
 
          <p style={{ fontSize:"14px", color:"var(--text-gray)", marginBottom:"20px" }}>Showing {filtered.length} request{filtered.length !== 1 ? "s" : ""}</p>
 
          {loading ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-gray)" }}>Loading requests...</div>
          ) : filtered.length === 0 ? (
            <p style={{ color:"var(--text-gray)", padding:"24px 0" }}>No requests found. Try adjusting your filters.</p>
          ) : (
            <div className="requests-grid">
              {filtered.map(req => (
                <div key={req._id} className="req-card" data-category={req.category} data-status={req.status}>
                  <div className="req-card-top"><span className={`badge ${badgeClass(req.status)}`}>{req.status}</span><span className="req-time">{new Date(req.createdAt).toLocaleDateString()}</span></div>
                  {isOnline(req) && <span style={{ display:"inline-block", fontSize:"11px", fontWeight:700, background:"#EEF2FF", color:"#4338CA", borderRadius:"6px", padding:"2px 8px", marginBottom:"6px" }}>🌐 Online</span>}
                  {req.image && <img src={req.image} alt="Request" style={{ width:"100%", height:"140px", objectFit:"cover", borderRadius:"8px", marginBottom:"10px" }}/>}
                  <h3>{req.title}</h3>
                  <p className="req-category">{req.category}</p>
                  <p className="req-desc">{req.description.substring(0,100)}...</p>
                  <div className="req-meta">
                    {isOnline(req) ? <span className="meta-info">🌐 Online Meeting</span> : <span className="meta-info">📍 {req.location}</span>}
                    {req.desiredDate ? <span className="meta-info">🕐 {new Date(req.desiredDate).toDateString()}</span> : <span className="meta-info">🕐 Flexible</span>}
                  </div>
                  {req.status === "In Progress" ? (
                    <button className="btn-offer" disabled style={{ background:"#e5e7eb", color:"#9ca3af", cursor:"not-allowed" }}>In Progress</button>
                  ) : (
                    <button className="btn-offer" onClick={() => openModal(req)}>Offer Help</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
 
      {loginPrompt && (
        <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }} onClick={() => setLoginPrompt(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:"16px", padding:"32px 28px", maxWidth:"360px", width:"100%", textAlign:"center", boxShadow:"0 20px 50px rgba(0,0,0,0.18)" }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:"24px" }}>🔒</div>
            <h3 style={{ fontSize:"18px", fontWeight:700, color:"#111827", margin:"0 0 8px" }}>Login Required</h3>
            <p style={{ fontSize:"14px", color:"#6b7280", lineHeight:1.6, margin:"0 0 24px" }}>You need to be logged in to offer help.</p>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => setLoginPrompt(false)} style={{ flex:1, padding:"11px 0", borderRadius:"10px", fontSize:"14px", fontWeight:600, cursor:"pointer", background:"#f3f4f6", color:"#374151", border:"1.5px solid #e5e7eb" }}>Cancel</button>
              <button onClick={() => window.location.href="/login"} style={{ flex:1, padding:"11px 0", borderRadius:"10px", fontSize:"14px", fontWeight:600, cursor:"pointer", background:"#1E3A8A", color:"#fff", border:"none" }}>Go to Login</button>
            </div>
          </div>
        </div>
      )}
 
      {selectedRequest && (
        <div className="modal-overlay" style={{ display:"flex" }} onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <h2 style={{ marginBottom:"4px" }}>{selectedRequest.title}</h2>
                <p className="modal-cat">{selectedRequest.category}</p>
              </div>
              {isOnline(selectedRequest) && <span style={{ fontSize:"12px", fontWeight:700, background:"#EEF2FF", color:"#4338CA", borderRadius:"8px", padding:"4px 10px", whiteSpace:"nowrap" }}>🌐 Online</span>}
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
 
            {!isOnline(selectedRequest) && OUTDOOR_CATEGORIES.includes(selectedRequest.category) && (
              <div style={{ margin:"12px 0", padding:"12px 14px", borderRadius:"10px", background:"#F0F9FF", border:"1px solid #BAE6FD", display:"flex", alignItems:"center", gap:"10px" }}>
                {weatherLoading ? (
                  <span style={{ fontSize:"13px", color:"#0369A1" }}>⏳ Fetching local weather...</span>
                ) : weather ? (
                  <>
                    <img src={weather.icon} alt={weather.desc} style={{ width:"48px", height:"48px" }}/>
                    <div>
                      <p style={{ fontWeight:700, fontSize:"14px", margin:0, color:"#0C4A6E" }}>{weather.city} — {weather.temp}°C, {weather.desc}</p>
                      <p style={{ fontSize:"12px", color:"#0369A1", margin:"2px 0 0" }}>Feels like {weather.feels}°C · Wind {weather.wind} km/h · Humidity {weather.humidity}%</p>
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize:"13px", color:"#0369A1" }}>🌤 Weather unavailable for this location</span>
                )}
              </div>
            )}
 
            <div className="modal-section">
              <label>Requested by</label>
              <div className="user-info"><span>{selectedRequest.postedBy?.name || "Unknown"}</span></div>
            </div>
 
            <div className="modal-section time-picker-box">
              <label>{isOnline(selectedRequest) ? "📅 Schedule Online Meeting Time" : "Set your convenient time"}</label>
              {isOnline(selectedRequest) && <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"8px" }}>No location needed — just pick a time and you'll coordinate the meeting link via messages.</p>}
              <input type="datetime-local" className="form-control" value={suggestedTime} onChange={e => setSuggestedTime(e.target.value)} style={{ borderColor: (!suggestedTime && offerStatus) ? "#dc2626" : "" }} />
            </div>
 
            {offerStatus && (
              <div style={{ marginTop:"10px", fontSize:"14px", padding:"10px 14px", borderRadius:"8px", background: offerStatus.type === "success" ? "#F0FDF4" : "#FEF2F2", color: offerStatus.type === "success" ? "#166534" : "#991B1B", border: `1px solid ${offerStatus.type === "success" ? "#BBF7D0" : "#FECACA"}` }}>{offerStatus.msg}</div>
            )}
 
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={confirmHelp} disabled={sendingOffer || !suggestedTime}>{sendingOffer ? "Sending..." : isOnline(selectedRequest) ? "📅 Schedule Meeting" : "Contact to Help"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import { useState, useEffect } from "react";

export default function MyRequestsPage() {
  const [tab, setTab]                       = useState("posted");
  const [postedRequests, setPosted]       = useState([]);
  const [helpingRequests, setHelping]     = useState([]);
  const [user, setUser]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [confirmModal, setConfirmModal]   = useState(null); 
  const [editingId, setEditingId]         = useState(null);
  const [editForm, setEditForm]           = useState({});
  const [toast, setToast]                 = useState(null);

  const ONLINE_CATEGORIES = ["IT Repair", "Tutoring"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, reqRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/requests/api/my"),
      ]);
      const profileData = await profileRes.json();
      const reqData     = await reqRes.json();
      if (profileData.success) setUser(profileData.user);
      if (reqData.success) {
        setPosted(reqData.postedRequests);
        setHelping(reqData.helpingRequests);
      }
    } catch { /* network err */ }
    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const cancelRequest = (id) => {
    setConfirmModal({
      icon: "🚫", iconBg: "#fef2f2",
      title: "Cancel Request?",
      msg: "This will permanently cancel your request. Volunteers who offered to help will be notified.",
      cancelLabel: "Keep Request", confirmLabel: "Cancel Request",
      confirmBg: "#dc2626", confirmHover: "#b91c1c",
      onConfirm: async () => {
        try {
          const data = await fetch(`/requests/${id}`, { method: "DELETE" }).then(r => r.json());
          if (data.success) {
            setPosted(prev => prev.filter(r => r._id !== id));
            showToast("Request cancelled and removed.");
          } else {
            showToast("Error: " + data.message);
          }
        } catch {
          showToast("Network error. Please try again.");
        }
      }
    });
  };

  const markCompleted = async (id) => {
    const data = await fetch(`/requests/${id}/complete`, { method: "PUT" }).then(r => r.json());
    if (data.success) {
      setPosted(prev => prev.map(r => r._id === id ? { ...r, status: "Completed" } : r));
      showToast("Request marked as completed!");
    } else showToast("Error: " + data.message);
  };

  const respondOffer = async (offerId, action) => {
    const data = await fetch(`/requests/offers/${offerId}/${action}`, { method: "PUT" }).then(r => r.json());
    if (data.success) {
      await loadData();
      showToast(action === "accept" ? "Offer accepted!" : "Offer rejected.");
    } else showToast("Error: " + data.message);
  };

  const withdrawOffer = (offerId) => {
    setConfirmModal({
      icon: "↩️", iconBg: "#fff7ed",
      title: "Withdraw from Request?",
      msg: "You will be removed as a helper. The request owner will be notified.",
      cancelLabel: "Stay", confirmLabel: "Withdraw",
      confirmBg: "#ea580c", confirmHover: "#c2410c",
      onConfirm: async () => {
        const data = await fetch(`/requests/offers/${offerId}/withdraw`, { method: "PUT" }).then(r => r.json());
        if (data.success) {
          setHelping(prev => prev.filter(o => o._id !== offerId));
          showToast("Offer withdrawn.");
        } else showToast("Error: " + data.message);
      }
    });
  };

  const startEdit = (req) => {
    setEditingId(req._id);
    setEditForm({ title: req.title, location: req.location, description: req.description });
  };

  const saveEdit = async (id) => {
    const data = await fetch(`/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    }).then(r => r.json());
    if (data.success) {
      setPosted(prev => prev.map(r => r._id === id ? { ...r, ...editForm } : r));
      setEditingId(null);
      showToast("Request updated!");
    } else showToast("Error: " + data.message);
  };

  const badgeClass = (status) =>
    status === "Open" ? "badge-open" :
    status === "In Progress" ? "badge-progress" :
    status === "Completed"   ? "badge-completed" : "badge-cancelled";

  const isOnline = (category) => ONLINE_CATEGORIES.includes(category);

  if (loading) return (
    <main className="main-content">
      <div style={{ textAlign:"center", padding:"80px 0", color:"var(--text-gray)" }}>
        Loading your requests...
      </div>
    </main>
  );

  const visiblePosted = postedRequests.filter(r => r.status !== "Cancelled");

  return (
    <>
      <main className="main-content">
        <div className="page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h1>My Requests</h1>
            <p>Manage your help requests and volunteering activities</p>
          </div>
          <a href="/requests/new" className="btn-primary">+ Post New Request</a>
        </div>

        <div className="section" style={{ paddingTop:"32px" }}>
          <div className="tabs">
            <button className={`tab-btn ${tab === "posted" ? "active" : ""}`} onClick={() => setTab("posted")}>
              Requests I Posted ({visiblePosted.length})
            </button>
            <button className={`tab-btn ${tab === "helping" ? "active" : ""}`} onClick={() => setTab("helping")}>
              Requests I&apos;m Helping With ({helpingRequests.length})
            </button>
          </div>

          {/* ── POSTED TAB ── */}
          {tab === "posted" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {visiblePosted.length === 0 && (
                <p style={{ color:"var(--text-gray)", padding:"24px 0" }}>
                  No requests yet. <a href="/requests/new">Post one!</a>
                </p>
              )}

              {visiblePosted.map(req => (
                <div key={req._id} className="my-req-item">
                  <div className="my-req-header">
                    <div className="my-req-header-top">
                      <span className={`badge ${badgeClass(req.status)}`}>{req.status}</span>
                      <span style={{ fontSize:"13px", color:"#6b7280" }}>{req.category}</span>
                      {isOnline(req.category) && (
                        <span style={{ fontSize:"11px", fontWeight:700, background:"#EEF2FF", color:"#4338CA", borderRadius:"6px", padding:"2px 8px" }}>🌐 Online</span>
                      )}
                    </div>
                    <h3 className="req-title">{req.title}</h3>
                  </div>

                  <div className="my-req-meta">
                    {isOnline(req.category)
                      ? <span className="meta-info">🌐 Online Meeting</span>
                      : <span className="meta-info">📍 <span className="req-location">{req.location}</span></span>
                    }
                    {req.desiredDate && (
                      <span className="meta-info">🕐 <span className="req-date">{new Date(req.desiredDate).toDateString()}</span></span>
                    )}
                  </div>

                  {(req.status === "In Progress" || req.status === "Completed") && req.acceptedVolunteer && (
                    <div className="helper-box">
                      <div className="helper-info">
                        <span className="helper-label">{req.status === "Completed" ? "Helped by:" : "Being helped by:"}</span>
                        <span className="helper-name">{req.acceptedVolunteer.name}</span>
                      </div>
                      <a href="/messages" className="btn-ghost">Message</a>
                    </div>
                  )}

                  {req.status === "Completed" && (
                    <p style={{ fontSize:"13px", color:"#6b7280" }}>Completed on {new Date(req.updatedAt).toDateString()}</p>
                  )}

                  {req.pendingOffers?.length > 0 && (
                    <div style={{ marginTop:"12px" }}>
                      <h4 style={{ fontSize:"14px", marginBottom:"8px" }}>Pending Help Offers ({req.pendingOffers.length})</h4>
                      {req.pendingOffers.map(offer => (
                        <div key={offer._id} className="helper-box" style={{ marginBottom:"8px" }}>
                          <div className="helper-info">
                            <span className="helper-name">{offer.volunteer.name}</span>
                            {offer.suggestedTime && (
                              <span style={{ fontSize:"12px", color:"#6b7280" }}>
                                {isOnline(req.category) ? "📅 Meeting:" : "⏰ Available:"} {new Date(offer.suggestedTime).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div style={{ display:"flex", gap:"8px" }}>
                            <button className="btn-blue" style={{ fontSize:"13px", padding:"6px 12px" }} onClick={() => respondOffer(offer._id, "accept")}>Accept</button>
                            <button className="btn-danger" style={{ fontSize:"13px", padding:"6px 12px" }} onClick={() => respondOffer(offer._id, "reject")}>Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {editingId === req._id && (
                    <div className="edit-form-inner" style={{ display:"flex", flexDirection:"column", gap:"10px", marginTop:"12px", padding:"16px", background:"#f9fafb", borderRadius:"12px", border:"1px solid #e5e7eb" }}>
                      <label className="edit-label">Title</label>
                      <input className="edit-input" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}/>
                      {!isOnline(req.category) && (
                        <>
                          <label className="edit-label">Location</label>
                          <input className="edit-input" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}/>
                        </>
                      )}
                      <label className="edit-label">Description</label>
                      <textarea className="edit-input" rows={3} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}/>
                      <div style={{ display:"flex", gap:"10px", marginTop:"4px" }}>
                        <button className="btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                        <button className="btn-blue" onClick={() => saveEdit(req._id)}>Save Changes</button>
                      </div>
                    </div>
                  )}

                  {editingId !== req._id && (
                    <div className="my-req-actions">
                      {req.status === "Open" && (
                        <>
                          <button className="btn-ghost" onClick={() => startEdit(req)}>Edit</button>
                          <button className="btn-danger" onClick={() => cancelRequest(req._id)}>Cancel Request</button>
                        </>
                      )}
                      {req.status === "In Progress" && (
                        <button className="btn-blue" onClick={() => markCompleted(req._id)}>Mark as Completed</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── HELPING TAB ── */}
          {tab === "helping" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {helpingRequests.length === 0 && (
                <p style={{ color:"var(--text-gray)", padding:"24px 0" }}>Not helping with anything yet. <a href="/requests">Browse requests!</a></p>
              )}

              {helpingRequests.map(offer => {
                const req = offer.request;
                if (!req) return null;
                const offerBadge = offer.status === "Accepted" ? "badge-progress" : offer.status === "Rejected" ? "badge-cancelled" : "badge-open";
                return (
                  <div key={offer._id} className="my-req-item">
                    <div className="my-req-header">
                      <div className="my-req-header-top">
                        <span className={`badge ${offerBadge}`}>Offer: {offer.status}</span>
                        <span style={{ fontSize:"13px", color:"#6b7280" }}>{req.category}</span>
                        {isOnline(req.category) && (
                          <span style={{ fontSize:"11px", fontWeight:700, background:"#EEF2FF", color:"#4338CA", borderRadius:"6px", padding:"2px 8px" }}>🌐 Online</span>
                        )}
                      </div>
                      <h3 className="req-title">{req.title}</h3>
                    </div>

                    <div className="my-req-meta">
                      {isOnline(req.category) ? <span className="meta-info">🌐 Online Meeting</span> : <span className="meta-info">📍 {req.location}</span>}
                      {offer.suggestedTime && (
                        <span className="meta-info">
                          {isOnline(req.category) ? "📅 Meeting time:" : "🕐 Your time:"} {new Date(offer.suggestedTime).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="helper-box">
                      <div className="helper-info">
                        <span className="helper-label">Requested by:</span>
                        <span className="helper-name">{req.postedBy?.name || "Unknown"}</span>
                      </div>
                      <a href="/messages" className="btn-ghost">Message</a>
                    </div>

                    <div className="my-req-actions">
                      {offer.status === "Accepted" && req.status === "In Progress" && (
                        <button className="btn-blue" onClick={() => markCompleted(req._id)}>Mark as Completed</button>
                      )}
                      {offer.status === "Pending" && (
                        <button className="btn-ghost" onClick={() => withdrawOffer(offer._id)}>Withdraw Offer</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {confirmModal && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={() => setConfirmModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:"20px", padding:"40px 36px", maxWidth:"420px", width:"90%", textAlign:"center", boxShadow:"0 24px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ width:"64px", height:"64px", borderRadius:"50%", background: confirmModal.iconBg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"30px" }}>{confirmModal.icon}</div>
            <h3 style={{ fontSize:"20px", fontWeight:700, color:"#111827", margin:"0 0 10px" }}>{confirmModal.title}</h3>
            <p style={{ fontSize:"14px", color:"#6b7280", lineHeight:1.6, margin:"0 0 28px" }}>{confirmModal.msg}</p>
            <div style={{ display:"flex", gap:"12px" }}>
              <button onClick={() => setConfirmModal(null)} style={{ flex:1, padding:"13px 0", borderRadius:"12px", fontSize:"14px", fontWeight:600, cursor:"pointer", background:"#f3f4f6", color:"#374151", border:"1.5px solid #e5e7eb" }}>{confirmModal.cancelLabel}</button>
              <button onClick={() => { setConfirmModal(null); confirmModal.onConfirm(); }} style={{ flex:1, padding:"13px 0", borderRadius:"12px", fontSize:"14px", fontWeight:600, cursor:"pointer", color:"#fff", background: confirmModal.confirmBg, border:"none" }}>{confirmModal.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", background:"#1E3A8A", color:"#fff", padding:"12px 24px", borderRadius:"12px", fontSize:"14px", fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.2)", zIndex:9999 }}>{toast}</div>
      )}
    </>
  );
}
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [stats, setStats]               = useState({ userCount: 0, requestCount: 0, messageCount: 0, adminCount: 0 });
  const [users, setUsers]               = useState([]);
  const [requests, setRequests]         = useState([]);
  const [messages, setMessages]         = useState([]);
  const [contactMessages, setContact]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("users");
  const [userSearch, setUserSearch]     = useState("");
  const [userRole, setUserRole]         = useState("");
  const [reqSearch, setReqSearch]       = useState("");
  const [reqStatus, setReqStatus]       = useState("");
  const [msgFilter, setMsgFilter]       = useState("");
  const [inboxFilter, setInboxFilter]   = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const [viewModal, setViewModal]       = useState(null);
  const [replyOpen, setReplyOpen]       = useState({});
  const [replyText, setReplyText]       = useState({});
  const [replySent, setReplySent]       = useState({});
  const [toast, setToast]               = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/admin/api");
      const data = await res.json();
      if (data.success) {
        setStats({
          userCount:    data.userCount,
          requestCount: data.requestCount,
          messageCount: data.messageCount,
          adminCount:   data.recentUsers.filter(u => u.role === "admin").length,
        });
        setUsers(data.recentUsers);
        setRequests(data.recentRequests);
        setMessages(data.recentMessages);
        setContact(data.contactMessages || []);
      }
    } catch (err) {
      showToast("Failed to load dashboard data.");
    }
    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

const deleteItem = async (url, id, setter, list) => {
  try {
    const res = await fetch(`${url}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (data.success || res.ok) {
      setter(prev => prev.filter(item => item._id !== id));
      showToast("Deleted successfully.");
    } else {
      showToast(data.message || "Delete failed.");
    }
  } catch (err) {
    console.error(err);
    showToast("Error deleting item.");
  }

  setConfirmModal(null);
};

  const confirm = (title, message, onConfirm) => {
    setConfirmModal({ title, message, onConfirm });
  };

  // ── FILTERS ──
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole   = !userRole || u.role === userRole;
    return matchSearch && matchRole;
  });

  const filteredRequests = requests.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(reqSearch.toLowerCase());
    const matchStatus = !reqStatus || r.status === reqStatus;
    return matchSearch && matchStatus;
  });

  const filteredMessages = messages.filter(m => {
    if (!msgFilter) return true;
    return msgFilter === "read" ? m.isRead : !m.isRead;
  });

  const filteredContact = contactMessages.filter(c => {
    if (!inboxFilter) return true;
    return inboxFilter === "read" ? c.isRead : !c.isRead;
  });

  const badgeClass = (status) =>
    status === "Open"        ? "badge-open"      :
    status === "In Progress" ? "badge-progress"  :
    status === "Completed"   ? "badge-completed" : "badge-progress";

  const roleBadgeStyle = (role) => ({
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "9999px",
    fontSize: "12px", fontWeight: 600,
    background: role === "admin" ? "#FEF3C7" : role === "volunteer" ? "#EEF2FF" : "#F3F4F6",
    color:      role === "admin" ? "#92400E"  : role === "volunteer" ? "#1E3A8A"  : "#374151",
  });

  if (loading) return (
    <main className="main-content" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <div style={{ textAlign:"center", color:"var(--text-gray)" }}>
        <div style={{ fontSize:"48px", marginBottom:"16px" }}>⚙️</div>
        <p style={{ fontSize:"16px" }}>Loading dashboard...</p>
      </div>
    </main>
  );

  return (
    <>
      <main className="main-content">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users, requests, and platform activity</p>
        </div>

        <div className="admin-page">

          {/* ── STATS ── */}
          <div className="stats-grid">
            {[
              { label: "Total Users",    value: stats.userCount,    bg: "#EEF2FF", emoji: "👥" },
              { label: "Total Requests", value: stats.requestCount, bg: "#D1FAE5", emoji: "📋" },
              { label: "Total Messages", value: stats.messageCount, bg: "#FFFBEB", emoji: "💬" },
              { label: "Admins",         value: stats.adminCount,   bg: "#FEE2E2", emoji: "🛡️" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg, fontSize: "24px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {s.emoji}
                </div>
                <div>
                  <p className="stat-number">{s.value}</p>
                  <p className="stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── TABS ── */}
          <div className="tabs" style={{ marginBottom:"28px" }}>
            {["users","requests","messages","inbox"].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {{ users:"👥 Users", requests:"📋 Requests", messages:"💬 Messages", inbox:"📩 Contact Inbox" }[tab]}
              </button>
            ))}
          </div>

          {/* ── USERS TAB ── */}
          {activeTab === "users" && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Manage Users</h2>
                <div className="filter-bar">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                  <select className="filter-select" value={userRole} onChange={e => setUserRole(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign:"center", color:"var(--text-gray)" }}>No users found</td></tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                            <div className="avatar" style={{ width:"32px", height:"32px", fontSize:"12px" }}>
                              {u.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
                            </div>
                            {u.name}
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td><span style={roleBadgeStyle(u.role)}>{u.role}</span></td>
                        <td>{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "N/A"}</td>
                        <td className="actions-cell">
                          <button className="btn-ghost" style={{ padding:"5px 10px", fontSize:"12px" }}
                            onClick={() => setViewModal({ type:"user", data:u })}>View</button>
                          <button className="btn-danger" style={{ padding:"5px 10px", fontSize:"12px" }}
                            onClick={() => confirm("Delete User?", `Are you sure you want to delete ${u.name}? This cannot be undone.`,
                              () => deleteItem("/admin/users", u._id, setUsers, users))}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── REQUESTS TAB ── */}
          {activeTab === "requests" && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Manage Requests</h2>
                <div className="filter-bar">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search requests..."
                    value={reqSearch}
                    onChange={e => setReqSearch(e.target.value)}
                  />
                  <select className="filter-select" value={reqStatus} onChange={e => setReqStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Posted By</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign:"center", color:"var(--text-gray)" }}>No requests found</td></tr>
                    ) : filteredRequests.map(r => (
                      <tr key={r._id}>
                        <td>{r.title}</td>
                        <td>{r.postedBy?.name || "Unknown"}</td>
                        <td><span className={`badge ${badgeClass(r.status)}`}>{r.status}</span></td>
                        <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}</td>
                        <td className="actions-cell">
                          <button className="btn-ghost" style={{ padding:"5px 10px", fontSize:"12px" }}
                            onClick={() => setViewModal({ type:"request", data:r })}>View</button>
                          <button className="btn-danger" style={{ padding:"5px 10px", fontSize:"12px" }}
                            onClick={() => confirm("Delete Request?", `Delete "${r.title}"? This cannot be undone.`,
                              () => deleteItem("/admin/requests", r._id, setRequests, requests))}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── MESSAGES TAB ── */}
          {activeTab === "messages" && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Recent Messages</h2>
                <div className="filter-bar">
                  <select className="filter-select" value={msgFilter} onChange={e => setMsgFilter(e.target.value)}>
                    <option value="">All Messages</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign:"center", color:"var(--text-gray)" }}>No messages yet</td></tr>
                    ) : filteredMessages.map(m => (
                      <tr key={m._id}>
                        <td>{m.sender?.name || "Unknown"}</td>
                        <td>{m.receiver?.name || "Unknown"}</td>
                        <td style={{ maxWidth:"200px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {m.content && m.content.length > 50 ? m.content.substring(0,50) + "..." : (m.content || "📎 Attachment")}
                        </td>
                        <td>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "N/A"}</td>
                        <td>
                          <span style={roleBadgeStyle(m.isRead ? "user" : "admin")}>
                            {m.isRead ? "Read" : "Unread"}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button className="btn-danger" style={{ padding:"5px 10px", fontSize:"12px" }}
                            onClick={() => confirm("Delete Message?", "Delete this message permanently?",
                              () => deleteItem("/admin/messages", m._id, setMessages, messages))}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CONTACT INBOX TAB ── */}
          {activeTab === "inbox" && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Contact Messages</h2>
                <div className="filter-bar">
                  <select className="filter-select" value={inboxFilter} onChange={e => setInboxFilter(e.target.value)}>
                    <option value="">All Messages</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>
              </div>

              {filteredContact.length === 0 ? (
                <p style={{ padding:"20px", color:"var(--text-gray)", fontSize:"14px" }}>No contact messages yet.</p>
              ) : filteredContact.map(cm => (
                <div key={cm._id} className={`inbox-card ${!cm.isRead ? "unread" : ""}`}
                  style={{ marginBottom:"14px" }}>
                  <div className="inbox-card-header">
                    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <div className="avatar" style={{ width:"40px", height:"40px", fontSize:"14px", flexShrink:0 }}>
                        {cm.name.split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <span className="inbox-name">{cm.name}</span>
                          <span className={`badge ${cm.isRead ? "badge-completed" : "badge-progress"}`} style={{ fontSize:"11px" }}>
                            {cm.isRead ? "Read" : "Unread"}
                          </span>
                        </div>
                        <span className="inbox-meta">
                          {cm.email} &nbsp;·&nbsp; {cm.createdAt ? new Date(cm.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                      {!cm.isRead && (
                        <button className="btn-ghost" style={{ padding:"5px 10px", fontSize:"12px" }}
                          onClick={() => setContact(prev => prev.map(c => c._id === cm._id ? {...c, isRead:true} : c))}>
                          Mark Read
                        </button>
                      )}
                      <button className="btn-danger" style={{ padding:"5px 10px", fontSize:"12px" }}
                        onClick={() => confirm("Delete Message?", "Delete this contact message?",
                          () => setContact(prev => prev.filter(c => c._id !== cm._id)))}>
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="inbox-subject">Subject: {cm.subject}</div>
                  <div className="inbox-body">{cm.message}</div>

                  {replySent[cm._id] ? (
                    <div className="inbox-reply-sent" style={{ display:"block" }}>
                      <div className="reply-label">✅ Replied by Community Help Hub Support Team</div>
                      {replySent[cm._id]}
                    </div>
                  ) : (
                    <>
                      {replyOpen[cm._id] && (
                        <div className="inbox-reply-area" style={{ display:"block" }}>
                          <textarea
                            className="inbox-reply-input"
                            placeholder="Reply as Community Help Hub Support Team..."
                            value={replyText[cm._id] || ""}
                            onChange={e => setReplyText(prev => ({ ...prev, [cm._id]: e.target.value }))}
                          />
                          <div style={{ display:"flex", justifyContent:"flex-end", gap:"8px", marginTop:"8px" }}>
                            <button className="btn-ghost" style={{ padding:"6px 14px", fontSize:"13px" }}
                              onClick={() => setReplyOpen(prev => ({ ...prev, [cm._id]: false }))}>
                              Cancel
                            </button>
                            <button className="btn-blue" style={{ padding:"6px 14px", fontSize:"13px" }}
                              onClick={() => {
                                if (!replyText[cm._id]?.trim()) return;
                                setReplySent(prev => ({ ...prev, [cm._id]: replyText[cm._id] }));
                                setReplyOpen(prev => ({ ...prev, [cm._id]: false }));
                                setContact(prev => prev.map(c => c._id === cm._id ? {...c, isRead:true} : c));
                                showToast("Reply sent!");
                              }}>
                              Send Reply
                            </button>
                          </div>
                        </div>
                      )}
                      {!replyOpen[cm._id] && (
                        <button className="inbox-reply-btn"
                          onClick={() => setReplyOpen(prev => ({ ...prev, [cm._id]: true }))}>
                          ↩ Reply
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* ── CONFIRM MODAL ── */}
      {confirmModal && (
        <div
  style={{
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(8px)"
  }}
>
  <div
    style={{
      width: "420px",
      background: "#162338",
      borderRadius: "20px",
      padding: "32px",
      textAlign: "center",
      boxShadow: "0 20px 60px rgba(0,0,0,.4)"
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        margin: "0 auto 20px",
        borderRadius: "50%",
        background: "#ff0000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "24px"
      }}
    >
      🗑️
    </div>

    <h3
      style={{
        color: "#fff",
        marginBottom: "10px"
      }}
    >
      {confirmModal.title}
    </h3>

    <p
      style={{
        color: "#94A3B8",
        marginBottom: "24px"
      }}
    >
      {confirmModal.message}
    </p>

    <div
      style={{
        display: "flex",
        gap: "12px"
      }}
    >
      <button
        className="btn-ghost"
        style={{
          flex: 1
        }}
        onClick={() => setConfirmModal(null)}
      >
        Cancel
      </button>

      <button
        style={{
          flex: 1,
          border: "none",
          borderRadius: "10px",
          background: "#ff4d4f",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
          padding: "12px"
        }}
        onClick={confirmModal.onConfirm}
      >
        Delete
      </button>
    </div>
  </div>
</div>

      {/* ── VIEW MODAL ── */}
      {viewModal && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(15,23,42,0.45)",
          backdropFilter:"blur(3px)", display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => setViewModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background:"var(--white)", borderRadius:"16px",
            padding:"24px 28px 28px", width:"100%", maxWidth:"440px", boxShadow:"0 20px 60px rgba(15,23,42,0.18)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h3 style={{ fontSize:"17px", fontWeight:700, margin:0 }}>Details</h3>
              <button onClick={() => setViewModal(null)} style={{ background:"none", border:"none",
                fontSize:"18px", cursor:"pointer", color:"var(--text-gray)", padding:"4px", borderRadius:"6px" }}>✕</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {viewModal.type === "user" ? (
                <>
                  {[
                    ["👤","Name",   viewModal.data.name],
                    ["✉️","Email",  viewModal.data.email],
                    ["🏷️","Role",   viewModal.data.role],
                    ["📅","Joined", viewModal.data.joinedAt ? new Date(viewModal.data.joinedAt).toDateString() : "N/A"],
                  ].map(([icon, label, value]) => (
                    <div key={label} style={{ display:"flex", flexDirection:"column", gap:"3px",
                      padding:"12px 0", borderBottom:"1px solid var(--border)" }}>
                      <span style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase",
                        letterSpacing:"0.06em", color:"var(--text-gray)" }}>{icon} {label}</span>
                      <span style={{ fontSize:"14px", fontWeight:500, color:"var(--text-dark)" }}>{value}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    ["📋","Title",     viewModal.data.title],
                    ["👤","Posted By", viewModal.data.postedBy?.name || "Unknown"],
                    ["🔘","Status",    viewModal.data.status],
                    ["📅","Date",      viewModal.data.createdAt ? new Date(viewModal.data.createdAt).toDateString() : "N/A"],
                    ["📍","Location",  viewModal.data.location || "N/A"],
                  ].map(([icon, label, value]) => (
                    <div key={label} style={{ display:"flex", flexDirection:"column", gap:"3px",
                      padding:"12px 0", borderBottom:"1px solid var(--border)" }}>
                      <span style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase",
                        letterSpacing:"0.06em", color:"var(--text-gray)" }}>{icon} {label}</span>
                      <span style={{ fontSize:"14px", fontWeight:500, color:"var(--text-dark)" }}>{value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)",
          background:"#1E3A8A", color:"#fff", padding:"12px 24px", borderRadius:"12px",
          fontSize:"14px", fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.2)", zIndex:9999 }}>
          {toast}
        </div>
      )}
    </>
  );
}
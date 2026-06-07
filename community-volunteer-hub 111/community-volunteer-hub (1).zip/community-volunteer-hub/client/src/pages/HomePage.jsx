import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Offer Modal ──────────────────────────────────────────────────────────────
function getMinDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function OfferModal({ request, user, onClose }) {
    const minDateTime = getMinDateTime();
  const [suggestedTime, setSuggestedTime] = useState("");
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState("");

  async function handleConfirm() {
  if (!suggestedTime) {
    setDateError("Please choose a date and time.");
    return;
  }

  const selectedMs = new Date(suggestedTime).getTime();
  const nowMs = Date.now();

  if (isNaN(selectedMs) || selectedMs <= nowMs) {
    setDateError("Please choose a future date and time.");
    return;
  }

  setDateError("");
  setLoading(true);
  try {
    const res = await fetch(`/requests/${request._id}/offer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestedTime }),
    });
    const data = await res.json();
    setStatus(data);
    if (data.success) {
      setTimeout(() => onClose(), 1500);
    }
  } catch {
    setStatus({ success: false, message: "Network error. Please try again." });
  } finally {
    setLoading(false);
  }
}

  const posterName = request.postedBy?.name || "Someone";

  return (
    <div
      id="offer-modal"
      className="modal-overlay"
      style={{ display: "flex" }}
      onClick={(e) => e.target.id === "offer-modal" && onClose()}
    >
      <div className="modal-content">
        <h2 id="modal-title">{request.title}</h2>
        <p id="modal-category" className="modal-cat">
          {request.category}
        </p>
        <div className="modal-grid">
          <div className="modal-item">
            <label>Location</label>
            <p id="modal-location">{request.location}</p>
          </div>
        </div>
        <div className="modal-section">
          <label>Requested by</label>
          <div className="user-info">
            <span id="modal-user">{posterName}</span>
          </div>
        </div>
        <div className="modal-section time-picker-box">
          <label>Set your convenient time</label>
          
 <input
  type="datetime-local"
  id="home-suggested-time"
  className="form-control"
  value={suggestedTime}
  min={minDateTime}

 onChange={(e) => {
  const selected = e.target.value;
  setSuggestedTime(selected);
  if (!selected || new Date(selected).getTime() <= Date.now()) {
    setDateError("Please choose a future date and time.");
  } else {
    setDateError("");
  }
}}
/>
{dateError && (
  <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "6px" }}>
    Please choose a future date and time.
  </p>
)}
        </div>
        {status && (
          <div
            id="offer-msg"
            style={{
              display: "block",
              marginTop: "10px",
              fontSize: "14px",
              color: status.success ? "green" : "red",
            }}
          >
            {status.message}
          </div>
        )}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            id="confirm-help-btn"
            onClick={handleConfirm}
            disabled={loading || status?.success}
          >
            {loading ? "Sending..." : status?.success ? "✓ Sent!" : "Contact to Help"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Login Prompt Modal ────────────────────────────────────────────────────────
function LoginPromptModal({ onClose }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "32px 28px",
          maxWidth: "360px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "24px",
          }}
        >
          🔒
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
          Login Required
        </h3>
        <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.6, margin: "0 0 24px" }}>
          You need to be logged in to offer help to someone in the community.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              background: "#f3f4f6",
              color: "#374151",
              border: "1.5px solid #e5e7eb",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              background: "#1E3A8A",
              color: "#fff",
              border: "none",
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────────
export default function HomePage({ user }) {
  const [recentRequests, setRecentRequests] = useState([]);
  const [topVolunteers, setTopVolunteers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch recent open requests
        const reqRes = await fetch("/requests/api?status=Open");
        const reqData = await reqRes.json();
        if (reqData.success) {
          setRecentRequests(reqData.requests.slice(0, 3));
        }

        // Fetch top volunteers via profile API
        const volRes = await fetch("/api/volunteers");
        if (volRes.ok) {
          const volData = await volRes.json();
          if (volData.success) setTopVolunteers(volData.volunteers.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function handleOfferHelp(req) {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      setSelectedRequest(req);
    }
  }

  function formatTimeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Help Your Neighbors –<br />
            Get Help When You Need
          </h1>
          <p>
            Building stronger communities by connecting people who need help with volunteers ready
            to lend a hand.
          </p>
          <div className="hero-buttons">
            <Link to="/requests/new" className="btn-primary">
              I Need Help
            </Link>
            <Link to="/requests" className="btn-hero-outline">
              I Want to Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section section-white">
        <div className="container container-center">
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Getting help or helping others is simple</p>
          <div className="grid-3">
            <div className="how-card">
              <div className="how-icon">
                <img src="/images/sign up.PNG" alt="Sign Up" />
              </div>
              <h3>1. Sign Up</h3>
              <p>Create your free account and add your skills if you want to volunteer.</p>
            </div>
            <div className="how-card">
              <div className="how-icon">
                <img src="/images/post and browse.PNG" alt="Post and Browse" />
              </div>
              <h3>2. Post or Browse</h3>
              <p>Post a help request or browse existing requests to find someone to help.</p>
            </div>
            <div className="how-card">
              <div className="how-icon">
                <img src="/images/connect and help.PNG" alt="Connect and Help" />
              </div>
              <h3>3. Connect &amp; Help</h3>
              <p>
                Message each other to coordinate, complete the task, and rate your experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECENT REQUESTS ── */}
      <section className="section section-bg">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title section-title-sm">Recent Help Requests</h2>
              <p className="section-desc">People in your community need your help</p>
            </div>
            <Link to="/requests" className="btn-ghost">
              View All
            </Link>
          </div>

          <div className="grid-4 grid-stretch">
            {loading ? (
              <p style={{ color: "var(--text-gray)" }}>Loading requests…</p>
            ) : recentRequests.length === 0 ? (
              <p style={{ color: "var(--text-gray)" }}>
                No open requests yet. Be the first to post one!
              </p>
            ) : (
              recentRequests.map((req) => (
                <div className="card card-full" key={req._id}>
  <div className="card-top-row">
    <span className="badge badge-open">{req.status}</span>
    <span className="card-time">{formatTimeAgo(req.createdAt)}</span>
  </div>
  {["IT Repair", "Tutoring"].includes(req.category) ? (
    <span style={{ display:"inline-block", fontSize:"11px", fontWeight:700, background:"#EEF2FF", color:"#4338CA", borderRadius:"6px", padding:"2px 8px", marginBottom:"6px" }}>🌐 Online Meeting</span>
  ) : (
    <span style={{ display:"inline-block", fontSize:"11px", fontWeight:700, background:"#D1FAE5", color:"#065F46", borderRadius:"6px", padding:"2px 8px", marginBottom:"6px" }}>📍 In-Person</span>
  )}
  <h4 className="card-title">{req.title}</h4>
  <p className="card-category">{req.category}</p>
  <div className="meta-info">
    {["IT Repair", "Tutoring"].includes(req.category) ? "🌐 Online Meeting" : `📍 ${req.location}`}
  </div>
                  {user ? (
                    <button
                      className="btn-offer btn-offer-full"
                      onClick={() => handleOfferHelp(req)}
                    >
                      Offer Help
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="btn-offer btn-offer-full"
                      style={{ textAlign: "center" }}
                    >
                      Login to Offer Help
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── TOP VOLUNTEERS ── */}
      <section className="section section-white">
        <div className="container container-center">
          <h2 className="section-title">Top Volunteers</h2>
          <p className="section-sub">Meet our most helpful community members</p>
          <div className="grid-4">
            {loading ? (
              <p style={{ color: "var(--text-gray)" }}>Loading volunteers…</p>
            ) : topVolunteers.length === 0 ? (
              <p style={{ color: "var(--text-gray)" }}>
                No volunteers yet. Sign up and add your skills!
              </p>
            ) : (
              topVolunteers.map((vol) => (
                <div className="card volunteer-card" key={vol._id}>
                  <div className="avatar avatar-lg volunteer-avatar">
                    {vol.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="volunteer-name">{vol.name}</h4>
                  <p className="volunteer-skill">
                    {vol.skills && vol.skills[0] ? vol.skills[0] : "Volunteer"}
                  </p>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(n => (n <= Math.floor(vol.rating || 0) ? "★" : "☆")).join("")}{" "}
                    <span className="volunteer-rating">{vol.rating || 0}</span>
                  </div>
                  <Link to={`/profile/${vol._id}`} className="btn-primary btn-profile">
                    View Profile
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <h2>Ready to Make a Difference?</h2>
        <p>Join thousands of community members helping each other every day.</p>
        <Link to="/register" className="btn-primary btn-cta">
          Get Started Today
        </Link>
      </section>

      {/* ── MODALS ── */}
      {selectedRequest && (
        <OfferModal
          request={selectedRequest}
          user={user}
          onClose={() => setSelectedRequest(null)}
        />
      )}
      {showLoginPrompt && <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />}
    </>
  );
}
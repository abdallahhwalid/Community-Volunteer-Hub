import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // credentials: 'include' sends the session cookie from Express to React
    fetch('/api/profile', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.success) setUser(data.user); })
      .catch(() => {});

    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved === 'dark' || (!saved && prefersDark);
    if (dark) document.documentElement.classList.add('dark');
    setIsDark(dark);
  }, []);

  const toggleDark = () => {
    const nowDark = !isDark;
    setIsDark(nowDark);
    document.documentElement.classList.toggle('dark', nowDark);
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await fetch('/logout', { credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <div className="nav-logo-icon">
          <img src="/images/logo.png" alt="Community Help Hub logo" />
        </div>
        <span className="nav-logo-text">Community Help Hub</span>
      </Link>
       <li><Link to="/">Home</Link></li>
        <li><Link to="/requests">Browse</Link></li>
        {user && <li><Link to="/requests/my">My Requests</Link></li>}
      <div className="nav-icons">
        <button className="nav-icon-btn dark-toggle" onClick={toggleDark} aria-label="Toggle dark mode" title="Toggle dark mode">
          {isDark ? '☀️' : '🌙'}
        </button>
        <Link to="/messages" className="nav-icon-btn" title="Messages">
          <img src="/images/messages1.png" alt="messages" className="nav-icon-img-sm" />
        </Link>
        <Link to="/profile" className="nav-icon-btn">
          <img src="/images/profile.png" alt="profile" className="nav-icon-img-md" />
        </Link>
        {user ? (
  <>
    <span style={{ fontSize: '14px', fontWeight: '600' }}>Hi, {user.name.split(' ')[0]}</span>
    
    {user?.role === 'admin' && (
      <Link to="/admin" className="btn-nav-signup">Admin</Link>
    )}
    
    <button onClick={handleLogout} className="btn-nav-login" style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
      Logout
    </button>
  </>
) : (
          <>
            <Link to="/login" className="btn-nav-login">Login</Link>
            <Link to="/register" className="btn-nav-signup">Sign Up</Link>   
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

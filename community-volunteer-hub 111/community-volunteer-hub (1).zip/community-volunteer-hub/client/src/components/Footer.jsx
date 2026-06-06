import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">
              <img src="/images/logo.png" alt="Community Help Hub logo" />
            </div>
            <span className="nav-logo-text">Community Help Hub</span>
          </Link>
          <p>Connecting local volunteers with people who need help.</p>
          <div className="footer-contact">
            <span>✉ support@communityhelpub.org</span>
            <span>📞 (555) 123-4567</span>
          </div>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/requests">Browse Requests</Link></li>
            <li><Link to="/requests/new">Post a Request</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/safety">Safety Guidelines</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copy">© 2026 Community Help Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

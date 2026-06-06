import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1>About Us</h1>
          <p>Building stronger neighborhoods, one favor at a time.</p>
        </div>
        <div className="static-page-card">
          <h3>Our Mission</h3>
          <p>At Community Help Hub, our mission is simple: to empower local communities by connecting those who need a helping hand with neighbors who are willing to give one. We believe that everyone has something valuable to offer, whether it's an hour of tutoring, a ride to the grocery store, or simply a listening ear.</p>
          <hr />
          <h3>How It Started</h3>
          <p>Community Help Hub was born out of a desire to bridge the gap between people in need and people who want to volunteer but don't know where to start. Often, the biggest challenges are right in our own backyards.</p>
          <hr />
          <h3>Our Core Values</h3>
          <ul>
            <li><strong>Community First:</strong> We prioritize local, neighborhood-level connections to build real, lasting trust.</li>
            <li><strong>Safety &amp; Security:</strong> We provide guidelines, reporting tools, and a secure platform so you can volunteer with peace of mind.</li>
            <li><strong>Inclusivity:</strong> Help knows no boundaries. Our platform is open to everyone, regardless of age, background, or skill level.</li>
          </ul>
          <div className="cta-box">
            <h4>Ready to make a difference?</h4>
            <p>Join our growing community today.</p>
            <a href="/register" className="btn-blue">Sign Up Now</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default AboutPage;

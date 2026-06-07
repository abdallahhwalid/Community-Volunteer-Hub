import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function StarRating({ rating }) {
  const filled = Math.floor(rating || 0);
  const stars = [1, 2, 3, 4, 5].map(n => (n <= filled ? '★' : '☆')).join('');
  return (
    <div className="stars">
      {stars} <span className="rating-text">{rating || 0}</span>
    </div>
  );
}

function VolunteerProfilePage() {
  const { id } = useParams();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/users/${id}`)
      .then(r => {
        if (r.status === 401 || r.status === 403) { navigate('/login'); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        if (data.success) {
          setUser(data.user);
        } else {
          setError(data.error || 'User not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Something went wrong');
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (error)   return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;

  const initials   = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const photoSrc   = user.photo && user.photo !== '/images/default-avatar.png' ? user.photo : null;
  const joinedDate = user.joinedAt ? new Date(user.joinedAt).toDateString() : '';

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>{user.name}'s Profile</h1>
        <p>Volunteer information</p>
      </div>
      <div className="profile-page">
        <div className="profile-card">
          <h2 className="profile-card-title">Profile Information</h2>
          <div className="profile-avatar-row">
            <div className="avatar-wrap">
              {photoSrc
                ? <img src={photoSrc} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                : <div className="avatar avatar-lg">{initials}</div>
              }
            </div>
            <div className="profile-info">
              <h3>{user.name}</h3>
              <div className="meta-info">📍 <span>{user.location || 'Location not set'}</span></div>
              <div className="meta-info">📅 Joined {joinedDate}</div>
              <StarRating rating={Math.floor(user.rating || 0)} />
            </div>
          </div>
          {user.bio && <p className="profile-card-sub">{user.bio}</p>}
        </div>
        <div className="profile-card">
          <h2 className="profile-card-title">Skills</h2>
          <div className="skills-container">
            {user.skills && user.skills.length > 0
              ? user.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)
              : <span className="no-skills-text">No skills added yet.</span>
            }
          </div>
        </div>
      </div>
    </main>
  );
}

export default VolunteerProfilePage;

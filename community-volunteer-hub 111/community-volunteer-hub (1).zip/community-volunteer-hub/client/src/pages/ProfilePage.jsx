import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
/*import Navbar from '../components/Navbar';
import Footer from '../components/Footer';*/

const SUGGESTED_SKILLS = [
  'IT Repair', 'Gardening', 'Tutoring', 'Home Tasks', 'Cooking',
  'Driving', 'Pet Care', 'Plumbing', 'Photography', 'Language Help',
  'Medical Advice', 'Child Care'
];

function ProfilePage() {
  const [user, setUser]               = useState(null);
  const [name, setName]               = useState('');
  const [location, setLocation]       = useState('');
  const [bio, setBio]                 = useState('');
  const [skills, setSkills]           = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [photoFile, setPhotoFile]     = useState(null);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [loading, setLoading]         = useState(true);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/profile')
      .then(r => {
        if (r.status === 401 || r.status === 403) { navigate('/login'); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        if (data.success) {
          const u = data.user;
          setUser(u);
          setName(u.name || '');
          setLocation(u.location || '');
          setBio(u.bio || '');
          setSkills(u.skills || []);
        } else {
          navigate('/login');
        }
        setLoading(false);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills(prev => [...prev, trimmed]);
  };

  const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill));

  const handleCustomSkillKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(customSkill); setCustomSkill(''); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG and PNG images are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      e.target.value = '';
      return;
    }

    setError('');
    setPhotoFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    formData.append('bio', bio);
    formData.append('skills', skills.join(','));
    if (photoFile) formData.append('photo', photoFile);
    const res = await fetch('/api/profile', { method: 'PUT', body: formData });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setSuccess('Profile saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(data.error || 'Something went wrong');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  const initials   = name.charAt(0).toUpperCase();
  const photoSrc   = avatarPreview || (user?.photo && user.photo !== '/images/default-avatar.png' ? user.photo : null);
  const joinedDate = user?.joinedAt ? new Date(user.joinedAt).toDateString() : '';

  return (
    <>
      
      <main className="main-content">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your information and skills</p>
        </div>
        <div className="profile-page">
          <form id="profile-form" onSubmit={handleSubmit}>
            <div className="profile-card">
              <h2 className="profile-card-title">Profile Information</h2>
              <p className="profile-card-sub">Update your photo and personal details</p>
              <div className="profile-avatar-row">
                <div className="avatar-wrap">
                  {photoSrc
                    ? <img src={photoSrc} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                    : <div className="avatar avatar-lg">{initials}</div>
                  }
                  <input type="file" ref={fileInputRef} accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="d-none" onChange={handlePhotoChange} />
                  <button type="button" className="avatar-edit-btn" onClick={() => fileInputRef.current.click()}>📷</button>
                </div>
                <div className="profile-info">
                  <h3>{name}</h3>
                  <div className="meta-info">📍 <span>{location || 'Location'}</span></div>
                  <div className="meta-info">📅 Joined {joinedDate}</div>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(n => (n <= Math.floor(user?.rating || 0) ? "★" : "☆")).join("")}{" "}
                    <span className="rating-text">{user?.rating || 0}</span>
                  </div>
                </div>
              </div>
              <p className="photo-hint">Click the 📷 icon to upload a profile photo (JPG, PNG — max 5MB)</p>
              <div className="form-group">
                <label htmlFor="full-name">Full Name</label>
                <input type="text" id="full-name" className="form-control" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="location">📍 Your Location</label>
                <input type="text" id="location" className="form-control" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Cairo, Nasr City" />
                <span className="form-hint">This helps volunteers near you find your requests</span>
              </div>
              <div className="form-group">
                <label htmlFor="bio">Bio <span className="text-optional">(optional)</span></label>
                <textarea id="bio" className="form-control" maxLength={200} value={bio} onChange={e => setBio(e.target.value)} />
                <span className="form-hint">{bio.length} / 200 characters</span>
              </div>
            </div>
            <div className="profile-card">
              <h2 className="profile-card-title">My Skills</h2>
              <p className="profile-card-sub">Add skills you can offer to help others.</p>
              <p className="skills-label skills-label-top">Quick pick — click to add:</p>
              <div className="suggested-skills">
                {SUGGESTED_SKILLS.map(skill => (
                  <button key={skill} type="button" className="skill-suggestion" onClick={() => addSkill(skill)}>{skill}</button>
                ))}
              </div>
              <p className="skills-label skills-label-mid">Your skills:</p>
              <div className="skills-container">
                {skills.length === 0
                  ? <span className="no-skills-text">No skills added yet.</span>
                  : skills.map(skill => (
                    <span key={skill} className="skill-tag">
                      {skill} <button type="button" onClick={() => removeSkill(skill)}>✕</button>
                    </span>
                  ))
                }
              </div>
              <div className="custom-skill-row">
                <input type="text" className="form-control skill-input-flex" placeholder="Or type a custom skill and press Enter..." value={customSkill} onChange={e => setCustomSkill(e.target.value)} onKeyDown={handleCustomSkillKey} />
                <button type="button" className="btn-blue" onClick={() => { addSkill(customSkill); setCustomSkill(''); }}>+ Add</button>
              </div>
              <div className="tip-box">
                <strong>💡 Tip:</strong> Add specific skills to increase your chances of being matched with relevant requests.
              </div>
            </div>
            {error   && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            {success && <div className="alert-success">✅ {success}</div>}
            <div className="profile-actions">
              <a href="/" className="btn-secondary">Cancel</a>
              <button type="submit" className="btn-blue btn-save">Save Changes</button>
            </div>
          </form>
        </div>
      </main>
     
    </>
  );
}

export default ProfilePage;

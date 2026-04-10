const volunteers = {
  sarah: { name: "Sarah Johnson", loc: "Downtown", joined: "Jan 2025", stars: "★★★★☆ 4.9", bio: "Expert in IT repair and tech support.", skills: ["IT Repair", "PC Support"] },
  michael: { name: "Michael Chen", loc: "Northside", joined: "June 2024", stars: "★★★★☆ 4.8", bio: "Experienced gardener.", skills: ["Gardening", "Planting"] },
  emily: { name: "Emily Davis", loc: "Westside", joined: "March 2026", stars: "★★★★★ 5.0", bio: "Available for math tutoring.", skills: ["Tutoring", "Math"] },
  james: { name: "James Wilson", loc: "Eastside", joined: "Sept 2025", stars: "★★★★☆ 4.7", bio: "Available for home tasks.", skills: ["Home Tasks", "Moving"] }
};

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('user');
  
  const container = document.getElementById('skills-container');
  const editActions = document.getElementById('edit-actions');
  const bioArea = document.getElementById('bio');
  const skillInputRow = document.getElementById('add-skill-row');

  if (userId && volunteers[userId]) {
    // --- VIEWING A VOLUNTEER (READ-ONLY) ---
    const v = volunteers[userId];
    document.getElementById('page-title').textContent = "Volunteer Profile";
    document.getElementById('display-name').textContent = v.name;
    document.getElementById('avatar-initials').textContent = v.name.split(' ').map(n => n[0]).join('').toUpperCase();
    bioArea.value = v.bio;
    bioArea.readOnly = true;
    if (editActions) editActions.style.display = 'none';
    if (skillInputRow) skillInputRow.style.display = 'none';
    
    container.innerHTML = "";
    v.skills.forEach(s => {
      container.innerHTML += `<span class="skill-tag">${s}</span>`;
    });
  } else {
    // --- MY PROFILE (LOADS YOUR SIGNED-IN NAME) ---
    const currentName = localStorage.getItem('userName') || "Guest User";
    const currentRole = localStorage.getItem('userRole') || "Member";

    document.getElementById('page-title').textContent = currentRole + " Profile";
    document.getElementById('display-name').textContent = currentName;
    document.getElementById('avatar-initials').textContent = currentName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    bioArea.readOnly = false;
    if (editActions) editActions.style.display = 'flex';
    if (skillInputRow) skillInputRow.style.display = 'flex';
  }
});

document.getElementById('profile-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = document.getElementById('save-success');
  msg.style.display = 'block';
  msg.classList.add('show');
  setTimeout(() => {
    msg.classList.remove('show');
    msg.style.display = 'none';
  }, 3000);
});
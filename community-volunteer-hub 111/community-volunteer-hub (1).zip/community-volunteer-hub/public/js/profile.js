// PROFILE PAGE JAVASCRIPT

// ── 1. PHOTO UPLOAD ──
// When user picks a file, show the image instead of the initials circle
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Check file size — max 5MB
  if (file.size > 5 * 1024 * 1024) {
    alert('Photo is too large. Please choose an image under 5MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById('avatar-img');
    const initials = document.getElementById('avatar-initials');

    // Show the image, hide the initials circle
    img.src = e.target.result;
    img.style.display = 'block';
    initials.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ── 2. LIVE PREVIEW (name + location update in the card above) ──
function updatePreview() {
  const name = document.getElementById('full-name').value.trim();
  const location = document.getElementById('location').value.trim();

  // Update displayed name
  if (name) {
    document.getElementById('display-name').textContent = name;
    // Update initials in avatar circle
    const parts = name.split(' ');
    const initials = parts.map(function(p) { return p[0]; }).join('').toUpperCase().slice(0, 2);
    document.getElementById('avatar-initials').textContent = initials;
  } else {
    document.getElementById('display-name').textContent = 'Guest User';
    document.getElementById('avatar-initials').textContent = 'GU';
  }

  // Update displayed location — show placeholder text if empty
  document.getElementById('display-location').textContent = location || 'Location';
}

// ── 3. BIO CHARACTER COUNTER ──
document.getElementById('bio').addEventListener('input', function() {
  const count = this.value.length;
  const counter = document.getElementById('bio-counter');
  counter.textContent = count + ' / 200 characters';
  counter.style.color = count > 180 ? '#EF4444' : 'var(--text-gray)';
});

// ── 4. SKILL SUGGESTIONS (click to add) ──
function addSuggestedSkill(btn) {
  const skillName = btn.textContent.trim();

  // Check if already added
  const existing = document.querySelectorAll('.skill-tag');
  for (let i = 0; i < existing.length; i++) {
    if (existing[i].dataset.skill === skillName) {
      btn.style.background = '#FEE2E2';
      btn.style.color = '#EF4444';
      btn.style.borderColor = '#EF4444';
      setTimeout(function() {
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 800);
      return; // already exists, don't add again
    }
  }

  // Mark suggestion button as selected
  btn.classList.add('selected');
  btn.disabled = true;

  // Add the skill tag
  createSkillTag(skillName, btn);
}

// ── 5. TYPE A CUSTOM SKILL ──
function addSkill() {
  const input = document.getElementById('skill-input');
  const skill = input.value.trim();
  if (!skill) return;

  // Check for duplicates
  const existing = document.querySelectorAll('.skill-tag');
  for (let i = 0; i < existing.length; i++) {
    if (existing[i].dataset.skill.toLowerCase() === skill.toLowerCase()) {
      input.style.borderColor = '#EF4444';
      setTimeout(function() { input.style.borderColor = ''; }, 800);
      return;
    }
  }

  createSkillTag(skill, null);
  input.value = '';
  input.focus();
}

// Enter key also adds a skill
document.getElementById('skill-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
});

// ── 6. CREATE A SKILL TAG (shared by both add methods) ──
function createSkillTag(skillName, suggestionBtn) {
  const container = document.getElementById('skills-container');

  // Hide "no skills" message
  const noMsg = document.getElementById('no-skills-msg');
  if (noMsg) noMsg.style.display = 'none';

  const tag = document.createElement('span');
  tag.className = 'skill-tag';
  tag.dataset.skill = skillName;
  tag.innerHTML = skillName + ' <button type="button" onclick="removeSkill(this, \'' + skillName + '\')">✕</button>';
  container.appendChild(tag);
}

// ── 7. REMOVE A SKILL TAG ──
function removeSkill(btn, skillName) {
  btn.closest('.skill-tag').remove();

  // Re-enable the suggestion button if it was a suggested skill
  const suggestions = document.querySelectorAll('.skill-suggestion');
  suggestions.forEach(function(s) {
    if (s.textContent.trim() === skillName) {
      s.classList.remove('selected');
      s.disabled = false;
    }
  });

  // Show "no skills" message if container is now empty
  const remaining = document.querySelectorAll('.skill-tag');
  if (remaining.length === 0) {
    document.getElementById('no-skills-msg').style.display = 'block';
  }
}

// ── 8. SAVE PROFILE ──
document.getElementById('profile-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const success = document.getElementById('save-success');
  success.classList.add('show');
  setTimeout(function() { success.classList.remove('show'); }, 3000);
});


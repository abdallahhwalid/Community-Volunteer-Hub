function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('Photo is too large. Please choose an image under 5MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById('avatar-img');
    const initials = document.getElementById('avatar-initials');
    img.src = e.target.result;
    img.style.display = 'block';
    img.classList.remove('d-none');
    initials.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function updatePreview() {
  const name = document.getElementById('full-name').value.trim();
  const location = document.getElementById('location').value.trim();
  if (name) {
    document.getElementById('display-name').textContent = name;
    const parts = name.split(' ');
    const initials = parts.map(function(p) { return p[0]; }).join('').toUpperCase().slice(0, 2);
    const initialsEl = document.getElementById('avatar-initials');
    if (initialsEl) initialsEl.textContent = initials;
  } else {
    document.getElementById('display-name').textContent = 'Guest User';
  }
  document.getElementById('display-location').textContent = location || 'Location';
}

document.getElementById('bio').addEventListener('input', function() {
  const count = this.value.length;
  const counter = document.getElementById('bio-counter');
  counter.textContent = count + ' / 200 characters';
  counter.style.color = count > 180 ? '#EF4444' : 'var(--text-gray)';
});

function addSuggestedSkill(btn) {
  const skillName = btn.textContent.trim();
  const existing = document.querySelectorAll('.skill-tag');
  for (let i = 0; i < existing.length; i++) {
    if (existing[i].dataset.skill === skillName) {
      btn.style.background = '#FEE2E2';
      setTimeout(function() { btn.style.background = ''; }, 800);
      return;
    }
  }
  btn.classList.add('selected');
  btn.disabled = true;
  createSkillTag(skillName);
  updateSkillsInput();
}

function addSkill() {
  const input = document.getElementById('skill-input');
  const skill = input.value.trim();
  if (!skill) return;
  const existing = document.querySelectorAll('.skill-tag');
  for (let i = 0; i < existing.length; i++) {
    if (existing[i].dataset.skill.toLowerCase() === skill.toLowerCase()) {
      input.style.borderColor = '#EF4444';
      setTimeout(function() { input.style.borderColor = ''; }, 800);
      return;
    }
  }
  createSkillTag(skill);
  updateSkillsInput();
  input.value = '';
  input.focus();
}

document.getElementById('skill-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
});

function createSkillTag(skillName) {
  const container = document.getElementById('skills-container');
  const noMsg = document.getElementById('no-skills-msg');
  if (noMsg) noMsg.style.display = 'none';
  const tag = document.createElement('span');
  tag.className = 'skill-tag';
  tag.dataset.skill = skillName;
  tag.innerHTML = skillName + ' <button type="button" onclick="removeSkill(this, \'' + skillName + '\')">✕</button>';
  container.appendChild(tag);
}

function removeSkill(btn, skillName) {
  btn.closest('.skill-tag').remove();
  const suggestions = document.querySelectorAll('.skill-suggestion');
  suggestions.forEach(function(s) {
    if (s.textContent.trim() === skillName) {
      s.classList.remove('selected');
      s.disabled = false;
    }
  });
  const remaining = document.querySelectorAll('.skill-tag');
  if (remaining.length === 0) {
    const noMsg = document.getElementById('no-skills-msg');
    if (noMsg) noMsg.style.display = 'block';
  }
  updateSkillsInput();
}

function updateSkillsInput() {
  const tags = document.querySelectorAll('.skill-tag');
  const skills = Array.from(tags).map(t => t.dataset.skill);
  document.getElementById('skills-data').value = skills.join(',');
}

document.getElementById('profile-form').addEventListener('submit', function(e) {
  updateSkillsInput();
});
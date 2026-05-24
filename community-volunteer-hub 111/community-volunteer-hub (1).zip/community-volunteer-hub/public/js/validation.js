// ── SHARED VALIDATION FUNCTIONS ──
// Used by: register.html, login.html, post-request.html, contact.html

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + '-error');
  if (field) field.classList.add('error');
  if (errorEl) { errorEl.textContent = message; errorEl.classList.add('show'); }
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + '-error');
  if (field) field.classList.remove('error');
  if (errorEl) errorEl.classList.remove('show');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return password.length >= 6;
}

// ── REGISTER FORM VALIDATION ──
function validateRegisterForm() {
  let valid = true;
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;
  const confirm = document.getElementById('confirm-password')?.value;

  clearError('name'); clearError('email');
  clearError('password'); clearError('confirm-password');

  if (!name || name.length < 2) {
    showError('name', 'Please enter your full name (at least 2 characters).');
    valid = false;
  }
  if (!email || !isValidEmail(email)) {
    showError('email', 'Please enter a valid email address.');
    valid = false;
  }
  if (!password || !isValidPassword(password)) {
    showError('password', 'Password must be at least 6 characters.');
    valid = false;
  }
  if (password !== confirm) {
    showError('confirm-password', 'Passwords do not match.');
    valid = false;
  }
  return valid;
}

// ── LOGIN FORM VALIDATION ──
function validateLoginForm() {
  let valid = true;
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;

  clearError('email'); clearError('password');

  if (!email || !isValidEmail(email)) {
    showError('email', 'Please enter a valid email address.');
    valid = false;
  }
  if (!password || password.length === 0) {
    showError('password', 'Please enter your password.');
    valid = false;
  }
  return valid;
}

// ── POST REQUEST FORM VALIDATION ──
function validatePostRequestForm() {
  let valid = true;
  const title = document.getElementById('title')?.value.trim();
  const category = document.getElementById('category')?.value;
  const description = document.getElementById('description')?.value.trim();
  const location = document.getElementById('location')?.value.trim();

  clearError('title'); clearError('category');
  clearError('description'); clearError('location');

  if (!title || title.length < 5) {
    showError('title', 'Please enter a descriptive title (at least 5 characters).');
    valid = false;
  }
  if (!category) {
    showError('category', 'Please select a category.');
    valid = false;
  }
  if (!description || description.length < 20) {
    showError('description', 'Please provide more detail (at least 20 characters).');
    valid = false;
  }
  if (!location || location.length < 3) {
    showError('location', 'Please enter a location.');
    valid = false;
  }
  return valid;
}

// ── CONTACT FORM VALIDATION ──
function validateContactForm() {
  let valid = true;
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const subject = document.getElementById('subject')?.value.trim();
  const message = document.getElementById('message')?.value.trim();

  clearError('name'); clearError('email');
  clearError('subject'); clearError('message');

  if (!name || name.length < 2) {
    showError('name', 'Please enter your name.');
    valid = false;
  }
  if (!email || !isValidEmail(email)) {
    showError('email', 'Please enter a valid email address.');
    valid = false;
  }
  if (!subject || subject.length < 3) {
    showError('subject', 'Please enter a subject.');
    valid = false;
  }
  if (!message || message.length < 10) {
    showError('message', 'Please write a message (at least 10 characters).');
    valid = false;
  }
  return valid;
}

// ── REAL-TIME CLEAR ON TYPING ──
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.form-control').forEach(function (input) {
    input.addEventListener('input', function () {
      clearError(this.id);
    });
  });
});

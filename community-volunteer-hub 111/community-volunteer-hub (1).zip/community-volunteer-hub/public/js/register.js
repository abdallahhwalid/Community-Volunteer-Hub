const form = document.getElementById('register-form');

form.addEventListener('submit', function (e) {
  e.preventDefault(); // Stop form to run frontend checks first

  let valid = validateRegisterForm();
  const termsChecked = document.getElementById('terms').checked;
  const termsError = document.getElementById('terms-error');

  if (!termsChecked) {
    setError(termsError, 'You must agree to the Terms of Service.');
    valid = false;
  } else {
    clearError(termsError);
  }

  // FIXED FOR BACKEND: If all checks pass, naturally submit to Express!
  if (valid) {
    form.submit(); 
  }
});

function validateRegisterForm() {
  let valid = true;
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const confirmPasswordError = document.getElementById('confirm-password-error');

  const namePattern = /^[A-Za-z\s]+$/;

  if (name === '') {
    setError(nameError, 'Full name is required.');
    valid = false;
  } else if (!namePattern.test(name)) {
    setError(nameError, 'Letters only please.');
    valid = false;
  } else { clearError(nameError); }

  if (!email.includes('@')) {
    setError(emailError, 'Enter a valid email.');
    valid = false;
  } else { clearError(emailError); }

  if (password.length < 6) {
    setError(passwordError, 'Min 6 characters.');
    valid = false;
  } else { clearError(passwordError); }

  if (confirmPassword !== password) {
    setError(confirmPasswordError, 'Passwords match error.');
    valid = false;
  } else { clearError(confirmPasswordError); }

  return valid;
}

function setError(element, message) {
  element.textContent = message;
  element.classList.add('show');
}

function removeError(element) { // Changed name slightly to avoid bugs
  element.textContent = '';
  if(element.classList.contains('show')) {
    element.classList.remove('show');
  }
}
// Mapping alias to protect any inner calls from validation.js
function clearError(element) { removeError(element); }
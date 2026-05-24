const form = document.getElementById('register-form');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  let valid = validateRegisterForm();
  const termsChecked = document.getElementById('terms').checked;
  const termsError = document.getElementById('terms-error');

  if (!termsChecked) {
    setError(termsError, 'You must agree to the Terms of Service.');
    valid = false;
  } else {
    clearError(termsError);
  }

  if (valid) {
    // SAVE DATA TO LOCALSTORAGE
    const name = document.getElementById('name').value.trim();
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', 'Member');

    document.getElementById('success-msg').classList.add('show');
    setTimeout(function () {
      window.location.href = 'login.html';
    }, 2000);
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

function clearError(element) {
  element.textContent = '';
  element.classList.remove('show');
}
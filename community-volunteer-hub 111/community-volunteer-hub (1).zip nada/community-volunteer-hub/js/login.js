document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const successMsg = document.getElementById('success-msg');

  let isValid = true;
  emailError.textContent = "";
  passwordError.textContent = "";

  // ADMIN OVERRIDE
  if (email === "admin@hub.com" && password === "admin123") {
    localStorage.setItem('userName', 'System Administrator');
    localStorage.setItem('userRole', 'Admin');
    successMsg.classList.add('show');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    return;
  }

  // STANDARD VALIDATION
  if (!email.includes('@')) {
    emailError.textContent = "Valid email required.";
    isValid = false;
  }
  if (password.length < 6) {
    passwordError.textContent = "Min 6 characters.";
    isValid = false;
  }

  if (isValid) {
    // If user skipped registration but logged in, give default name
    if(!localStorage.getItem('userName')) {
        localStorage.setItem('userName', 'Community Member');
        localStorage.setItem('userRole', 'Member');
    }
    successMsg.classList.add('show');
    setTimeout(() => { window.location.href = 'index.html'; }, 2000);
  }
});
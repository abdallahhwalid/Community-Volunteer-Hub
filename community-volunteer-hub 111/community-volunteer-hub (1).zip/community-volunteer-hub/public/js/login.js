const form = document.getElementById('login-form');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  let valid = true;
  emailError.textContent = '';
  passwordError.textContent = '';

  if (!email.includes('@')) {
    emailError.textContent = 'Valid email required.';
    valid = false;
  }

  if (password.length < 6) {
    passwordError.textContent = 'Min 6 characters.';
    valid = false;
  }

  if (valid) {
    form.submit();
  }
});

// Forgot password modal
const forgotPasswordLink = document.getElementById('forgot-password-link');
const recoveryModal = document.getElementById('recovery-modal');
const closeModalBtn = document.getElementById('close-modal');
const step1Div = document.getElementById('step-1-email');
const step2Div = document.getElementById('step-2-reset');
const recoveryDesc = document.getElementById('recovery-desc');
const recoverySuccessMsg = document.getElementById('recovery-success-msg');
const sendRecoveryBtn = document.getElementById('send-recovery-btn');
const confirmResetBtn = document.getElementById('confirm-reset-btn');

forgotPasswordLink.addEventListener('click', function(e) {
  e.preventDefault();
  recoveryModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', function() {
  recoveryModal.classList.add('hidden');
  resetModalState();
});

function resetModalState() {
  step1Div.classList.remove('hidden');
  step2Div.classList.add('hidden');
  recoverySuccessMsg.classList.add('hidden');
  document.getElementById('recovery-email').value = '';
  document.getElementById('recovery-code').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('recovery-email-error').textContent = '';
  document.getElementById('new-password-error').textContent = '';
  recoveryDesc.textContent = 'Enter your email for a verification code.';
}

sendRecoveryBtn.addEventListener('click', function() {
  const emailInput = document.getElementById('recovery-email').value.trim();
  const emailError = document.getElementById('recovery-email-error');
  if (!emailInput.includes('@')) {
    emailError.textContent = 'Please enter a valid email address.';
    return;
  }
  emailError.textContent = '';
  step1Div.classList.add('hidden');
  step2Div.classList.remove('hidden');
  recoveryDesc.textContent = 'Enter the code we sent to your email, and create a new password.';
});

confirmResetBtn.addEventListener('click', function() {
  const codeInput = document.getElementById('recovery-code').value.trim();
  const newPasswordInput = document.getElementById('new-password').value.trim();
  const codeError = document.getElementById('recovery-code-error');
  const newPasswordError = document.getElementById('new-password-error');

  codeError.textContent = '';
  newPasswordError.textContent = '';

  if (codeInput.length < 6) {
    codeError.textContent = 'Code must be at least 6 characters.';
    return;
  }
  if (newPasswordInput.length < 6) {
    newPasswordError.textContent = 'New password must be at least 6 characters.';
    return;
  }

  step2Div.classList.add('hidden');
  recoveryDesc.textContent = '';
  recoverySuccessMsg.classList.remove('hidden');

  setTimeout(() => {
    recoveryModal.classList.add('hidden');
    resetModalState();
  }, 3000);
});
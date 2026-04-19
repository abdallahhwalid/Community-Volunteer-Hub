//  LOGIN FORM LOGIC
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

  if (email === "user@hub.com" && password === "user123") {
    localStorage.setItem('userName', 'User 1');
    localStorage.setItem('userRole', 'User');
    successMsg.classList.add('show');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    return;
  }


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



// FORGOT PASSWORD


// Find Elements
const forgotPasswordLink = document.getElementById('forgot-password-link');
const recoveryModal = document.getElementById('recovery-modal');
const closeModalBtn = document.getElementById('close-modal');

const step1Div = document.getElementById('step-1-email');
const step2Div = document.getElementById('step-2-reset');
const recoveryDesc = document.getElementById('recovery-desc');
const recoverySuccessMsg = document.getElementById('recovery-success-msg');

const sendRecoveryBtn = document.getElementById('send-recovery-btn');
const confirmResetBtn = document.getElementById('confirm-reset-btn');

// Open Modal
forgotPasswordLink.addEventListener('click', function(event) {
    event.preventDefault(); 
    recoveryModal.classList.remove('hidden'); 
});

// Close Modal & Reset Form back to Step 1
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

// STEP 1: Check Email & Move to Step 2
sendRecoveryBtn.addEventListener('click', function() {
    const emailInput = document.getElementById('recovery-email').value.trim();
    const emailError = document.getElementById('recovery-email-error');
    
    // Validate Email
    if (!emailInput.includes('@')) {
        emailError.textContent = "Please enter a valid email address.";
        return; // Stop here if wrong
    }
    
    // If correct, hide Step 1 and show Step 2
    emailError.textContent = "";
    step1Div.classList.add('hidden');
    step2Div.classList.remove('hidden');
    recoveryDesc.textContent = 'Enter the code we sent to your email, and create a new password.';
});

// STEP 2: Check New Password & Finish
confirmResetBtn.addEventListener('click', function() {
    const codeInput = document.getElementById('recovery-code').value.trim();
    const newPasswordInput = document.getElementById('new-password').value.trim();
    const newPasswordError = document.getElementById('new-password-error');
    const codeError = document.getElementById('recovery-code-error'); 
    
    if (codeError) codeError.textContent = "";
    if (newPasswordError) newPasswordError.textContent = "";

    // 1. Check Verification Code
    if (codeInput === "") {
        codeError.textContent = "Please enter the verification code."; 
        return;
    } else if (codeInput.length < 6) {
        
        codeError.textContent = "Verification code must be at least 6 characters.";
        return;
    }
    
    // 2. Check New Password
    if (newPasswordInput.length < 6) {
        newPasswordError.textContent = "New password must be at least 6 characters.";
        return; 
    }
    
    // If everything is correct, show success!
    step2Div.classList.add('hidden');
    recoveryDesc.textContent = '';
    recoverySuccessMsg.classList.remove('hidden');
    
    // Automatically close the modal after 3 seconds so they can log in
    setTimeout(() => {
        recoveryModal.classList.add('hidden');
        resetModalState();
    }, 3000);
});
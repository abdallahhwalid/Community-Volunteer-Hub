// CONTACT PAGE JAVASCRIPT
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  if (validateContactForm()) {
    document.getElementById('success-msg').classList.add('show');
    this.reset();
  }
});

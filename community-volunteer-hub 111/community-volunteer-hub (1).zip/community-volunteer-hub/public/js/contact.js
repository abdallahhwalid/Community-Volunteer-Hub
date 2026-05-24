document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  if (validateContactForm()) {
    const successEl = document.getElementById('success-msg');
    successEl.classList.add('show');
    this.reset();
    setTimeout(function() {
      successEl.classList.remove('show');
    }, 6000);
  }
});
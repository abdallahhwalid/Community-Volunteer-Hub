// POST REQUEST PAGE JAVASCRIPT
document.getElementById('post-request-form').addEventListener('submit', function(e) {
  e.preventDefault();
  if (validatePostRequestForm()) {
    document.getElementById('success-msg').classList.add('show');
    setTimeout(function() { window.location.href = 'requests.html'; }, 2000);
  }
});

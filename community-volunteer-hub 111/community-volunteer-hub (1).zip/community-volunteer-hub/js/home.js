// HOME PAGE JAVASCRIPT

// Offer Help buttons - redirect to requests page
document.querySelectorAll('.btn-offer').forEach(function(btn) {
  btn.addEventListener('click', function() {
    window.location.href = 'requests.html';
  });
});

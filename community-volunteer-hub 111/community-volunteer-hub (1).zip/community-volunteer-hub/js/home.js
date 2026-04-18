// HOME PAGE JAVASCRIPT

// Offer Help buttons - redirect to requests page

// document.addEventListener('DOMContentLoaded', function() {
//   document.querySelectorAll('.btn-offer').forEach(function(btn) {
//     btn.addEventListener('click', function() {
//       window.location.href = 'requests.html';
//     });
//   });
// });
document.addEventListener('DOMContentLoaded', function() {
  const requests = [
    { title: 'Need help moving furniture', category: 'Home Tasks', desc: 'I\'m moving to a new apartment and need help carrying some heavy furniture down two flights of stairs.', location: '📍 Downtown', time: '🕐 April 10, 2026 at 2:00 PM', user: 'Sarah Miller' },
    { title: 'Computer repair', category: 'IT Repair', desc: 'My laptop suddenly stopped working. It won\'t turn on at all, even when plugged in. I need someone to take a look.', location: '📍 Westside', time: '🕐 April 8, 2026 at Flexible', user: 'Ahmed Ali' }
  ];

  const btns = document.querySelectorAll('.btn-offer');
  btns.forEach(function(btn, index) {
    btn.addEventListener('click', function() {
      const r = requests[index];
      document.getElementById('modal-title').textContent    = r.title;
      document.getElementById('modal-category').textContent = r.category;
      document.getElementById('modal-desc').textContent     = r.desc;
      document.getElementById('modal-location').textContent = r.location;
      document.getElementById('modal-time-orig').textContent = r.time;
      document.getElementById('modal-user').textContent     = r.user;
      document.getElementById('offer-modal').style.display  = 'flex';
    });
  });

  document.getElementById('offer-modal').addEventListener('click', function(e) {
    if (e.target === this) this.style.display = 'none';
  });
});
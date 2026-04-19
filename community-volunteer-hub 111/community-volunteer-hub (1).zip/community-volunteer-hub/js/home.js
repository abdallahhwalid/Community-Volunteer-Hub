// HOME PAGE JAVASCRIPT

document.addEventListener('DOMContentLoaded', function () {
  const requests = [
    {
      id: 1,
      title: 'Need help moving furniture',
      category: 'Home Tasks',
      desc: "I'm moving to a new apartment and need help carrying some heavy furniture down two flights of stairs.",
      location: '📍 Downtown',
      time: '🕐 April 10, 2026 at 2:00 PM',
      user: 'Sarah Miller'
    },
    {
      id: 2,
      title: 'Computer repair',
      category: 'IT Repair',
      desc: "My laptop suddenly stopped working. It won't turn on at all, even when plugged in. I need someone to take a look.",
      location: '📍 Westside',
      time: '🕐 April 8, 2026 at Flexible',
      user: 'Ahmed Ali'
    }
  ];

  let activeRequestId = null;

  // Open modal on Offer Help click
  document.querySelectorAll('.btn-offer').forEach(function (btn, index) {
    btn.addEventListener('click', function () {
      const r = requests[index];
      activeRequestId = r.id;

      document.getElementById('modal-title').textContent     = r.title;
      document.getElementById('modal-category').textContent  = r.category;
      document.getElementById('modal-desc').textContent      = r.desc;
      document.getElementById('modal-location').textContent  = r.location;
      document.getElementById('modal-time-orig').textContent = r.time;
      document.getElementById('modal-user').textContent      = r.user;

      const timePicker = document.getElementById('suggested-time');
      if (timePicker) timePicker.value = '';

      document.getElementById('offer-modal').style.display = 'flex';
    });
  });

  // Close on Cancel button
  document.getElementById('modal-cancel-btn').addEventListener('click', function () {
    document.getElementById('offer-modal').style.display = 'none';
  });

  // Close on backdrop click
  document.getElementById('offer-modal').addEventListener('click', function (e) {
    if (e.target === this) this.style.display = 'none';
  });

  // Contact to Help button
  document.getElementById('confirm-help-btn').addEventListener('click', function () {
    const picker = document.getElementById('suggested-time');
    if (!picker.value) {
      picker.style.borderColor = '#dc2626';
      picker.focus();
      return;
    }
    picker.style.borderColor = '';
    document.getElementById('offer-modal').style.display = 'none';

    const r = requests.find(function (x) { return x.id === activeRequestId; });
    window.location.href =
      'messages.html?autoMsg=true&datetime=' +
      encodeURIComponent(picker.value) +
      '&user=' +
      encodeURIComponent(r ? r.user : '');
  });
});
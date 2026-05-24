// HOME PAGE JAVASCRIPT


function showLoginPrompt() {
  const existing = document.getElementById('login-prompt-modal');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.textContent = '@keyframes popIn{from{transform:scale(.88) translateY(12px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}';
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'login-prompt-modal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:999;background:rgba(15,23,42,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px 28px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.18);animation:popIn .25s cubic-bezier(.34,1.56,.64,1);">
      <div style="width:56px;height:56px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;">🔒</div>
      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px;">Login Required</h3>
      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 24px;">You need to be logged in to offer help to someone in the community.</p>
      <div style="display:flex;gap:10px;">
        <button id="lp-cancel" style="flex:1;padding:11px 0;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;background:#f3f4f6;color:#374151;border:1.5px solid #e5e7eb;">Cancel</button>
        <button id="lp-login"  style="flex:1;padding:11px 0;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;background:#1E3A8A;color:#fff;border:none;">Go to Login</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.getElementById('lp-cancel').onclick = () => overlay.remove();
  document.getElementById('lp-login').onclick  = () => { window.location.href = 'login.html'; };
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}


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

  
 // Open modal on Offer Help click — check login first
document.querySelectorAll('.btn-offer').forEach(function (btn, index) {
  btn.addEventListener('click', function () {
    if (!localStorage.getItem('userName')) {
      showLoginPrompt();
      return;
    }
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
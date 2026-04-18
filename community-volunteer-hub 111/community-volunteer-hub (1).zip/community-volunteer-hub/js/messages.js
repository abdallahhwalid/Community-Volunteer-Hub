window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('autoMsg') === 'true') {
    const datetimeVal = urlParams.get('datetime');
    const userName    = urlParams.get('user');

    if (datetimeVal && userName) {
      const dateObj    = new Date(datetimeVal);
      const dayName    = dateObj.toLocaleDateString(undefined, { weekday: 'long' });
      const timeString = dateObj.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
      const autoMessage = `Hi! I saw your request and I can help on ${dayName} at ${timeString} 😊`;
      const initials    = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      // ── Add or find the contact in the sidebar ──
      const convList = document.getElementById('conv-list');
      let existing = [...convList.querySelectorAll('.conv-item')].find(
        el => el.querySelector('.conv-name')?.textContent === userName
      );

      if (!existing) {
        existing = document.createElement('div');
        existing.className = 'conv-item';
        existing.innerHTML = `
          <div class="avatar">${initials}</div>
          <div class="conv-info">
            <div class="conv-header">
              <span class="conv-name">${userName}</span>
              <span class="conv-time">Just now</span>
            </div>
            <p class="conv-preview">${autoMessage}</p>
          </div>`;
        existing.onclick = () => openConvEl(existing, userName, initials, 'Active now');
        convList.prepend(existing); // add to top of list
      }

      // ── Open that conversation ──
      openConvEl(existing, userName, initials, 'Active now');

      // ── Send the auto message ──
      setTimeout(() => {
        document.getElementById('msg-input').value = autoMessage;
        sendMessage();
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 200);
    }
  }
};

/* ── Send a message ── */
function sendMessage() {
  const input = document.getElementById('msg-input');
  const text  = input.value.trim();
  if (!text) return;

  const container = document.getElementById('chat-messages');
  const timeDisplay = getTimeString();

  const msg = document.createElement('div');
  msg.className = 'msg msg-sent';
  msg.innerHTML = `<div class="bubble bubble-sent">${text}</div><span class="msg-time">${timeDisplay}</span>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  // Update sidebar preview
  const activeConv = document.querySelector('.conv-item.active');
  if (activeConv) {
    const preview = activeConv.querySelector('.conv-preview');
    const timeEl  = activeConv.querySelector('.conv-time');
    if (preview) preview.textContent = text;
    if (timeEl)  timeEl.textContent  = timeDisplay;
  }

  input.value = '';
}

document.getElementById('msg-input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
});

/* ── Open a conversation (used by hardcoded sidebar items) ── */
function openConv(el, name, initials, status) {
  openConvEl(el, name, initials, status);
}

function openConvEl(el, name, initials, status) {
  document.querySelectorAll('.conv-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');

  document.getElementById('chat-contact-name').textContent = name;
  document.getElementById('chat-contact-status').textContent = status;

  const avatarEl = document.querySelector('.chat-panel-header .avatar');
  if (avatarEl) avatarEl.textContent = initials;

  const container = document.getElementById('chat-messages');
  container.innerHTML = `<p style="text-align:center;color:var(--text-gray);font-size:13px;margin:auto;">Start of your conversation with ${name}</p>`;
}

/* ── Filter sidebar ── */
function filterConversations() {
  const val = document.getElementById('conv-search').value.toLowerCase();
  document.querySelectorAll('.conv-item').forEach(item => {
    const name = item.querySelector('.conv-name').textContent.toLowerCase();
    item.style.display = name.includes(val) ? 'flex' : 'none';
  });
}

/* ── Helper ── */
function getTimeString() {
  const now  = new Date();
  let h      = now.getHours(), m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
}
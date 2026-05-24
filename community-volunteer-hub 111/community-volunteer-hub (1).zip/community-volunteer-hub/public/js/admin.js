// ADMIN PAGE JAVASCRIPT

// ── Custom modal confirm ──────────────────────────────
let _modalCallback = null;

function showConfirm({ title, message, icon = '⚠️', continueBtnClass = 'btn-danger', continueBtnText = 'Continue' }, onConfirm) {
  document.getElementById('modal-title').textContent   = title;
  document.getElementById('modal-message').textContent = message;
  document.getElementById('modal-icon').innerHTML      = icon;

  const continueBtn = document.getElementById('modal-continue');
  continueBtn.className   = 'modal-btn ' + continueBtnClass;
  continueBtn.textContent = continueBtnText;

  _modalCallback = onConfirm;
  document.getElementById('confirm-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('confirm-modal').style.display = 'none';
  _modalCallback = null;
}

document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-continue').addEventListener('click', function () {
  if (_modalCallback) _modalCallback();
  closeModal();
});
document.getElementById('confirm-modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ── View modal ────────────────────────────────────────
function closeViewModal() {
  document.getElementById('view-modal').style.display = 'none';
}
document.getElementById('view-modal-close').addEventListener('click', closeViewModal);
document.getElementById('view-modal').addEventListener('click', function (e) {
  if (e.target === this) closeViewModal();
});

// ── Filter users table ────────────────────────────────
function filterUsers() {
  const search = document.getElementById('user-search').value.toLowerCase();
  const role   = document.getElementById('user-role-filter').value.toLowerCase();
  const status = document.getElementById('user-status-filter').value.toLowerCase();

  document.querySelectorAll('#users-table tbody tr').forEach(function (row) {
    const text       = row.textContent.toLowerCase();
    const roleCell   = row.querySelector('td:nth-child(3)').textContent.trim().toLowerCase();
    const statusCell = row.querySelector('td:nth-child(4)').textContent.trim().toLowerCase();

    const matchSearch = text.includes(search);
    const matchRole   = role   === '' || roleCell === role;
    const matchStatus = status === '' || statusCell === status;

    row.style.display = (matchSearch && matchRole && matchStatus) ? '' : 'none';
  });
}

// ── Filter requests table ─────────────────────────────
function filterRequests() {
  const search   = document.getElementById('req-search').value.toLowerCase();
  const category = document.getElementById('req-category-filter').value.toLowerCase();
  const status   = document.getElementById('req-status-filter').value.toLowerCase();

  document.querySelectorAll('#requests-table tbody tr').forEach(function (row) {
    const text         = row.textContent.toLowerCase();
    const categoryCell = row.querySelector('td:nth-child(2)').textContent.trim().toLowerCase();
    const statusCell   = row.querySelector('td:nth-child(4)').textContent.trim().toLowerCase();

    const matchSearch   = text.includes(search);
    const matchCategory = category === '' || categoryCell === category;
    const matchStatus   = status   === '' || statusCell   === status;

    row.style.display = (matchSearch && matchCategory && matchStatus) ? '' : 'none';
  });
}

// ── View row details ──────────────────────────────────
function viewRow(btn) {
  const row     = btn.closest('tr');
  const cells   = row.querySelectorAll('td');
  const isUsers = row.closest('table').id === 'users-table';
  const body    = document.getElementById('view-modal-body');

  let html = '<div class="view-grid">';

  if (isUsers) {
    const nameEl    = cells[0].cloneNode(true);
    const avatarDiv = nameEl.querySelector('.avatar');
    if (avatarDiv) avatarDiv.remove();
    const name   = nameEl.textContent.trim();
    const email  = cells[1].textContent.trim();
    const role   = cells[2].textContent.trim();
    const status = cells[3].textContent.trim();
    const joined = cells[4].textContent.trim();

    html += field('👤', 'Name',   name);
    html += field('✉️', 'Email',  email);
    html += field('🏷️', 'Role',   role);
    html += field('🔘', 'Status', status);
    html += field('📅', 'Joined', joined);
  } else {
    const title    = cells[0].textContent.trim();
    const category = cells[1].textContent.trim();
    const postedBy = cells[2].textContent.trim();
    const status   = cells[3].textContent.trim();
    const date     = cells[4].textContent.trim();

    html += field('📋', 'Title',     title);
    html += field('🗂️', 'Category',  category);
    html += field('👤', 'Posted By', postedBy);
    html += field('🔘', 'Status',    status);
    html += field('📅', 'Date',      date);
  }

  html += '</div>';
  body.innerHTML = html;
  document.getElementById('view-modal').style.display = 'flex';
}

function field(icon, label, value) {
  return `
    <div class="view-field">
      <span class="view-field-label">${icon} ${label}</span>
      <span class="view-field-value">${value}</span>
    </div>`;
}

// ── Suspend user ──────────────────────────────────────
function suspendUser(btn) {
  const row       = btn.closest('tr');
  const nameEl    = row.querySelector('td:first-child').cloneNode(true);
  const avatarDiv = nameEl.querySelector('.avatar');
  if (avatarDiv) avatarDiv.remove();
  const name = nameEl.textContent.trim();

  showConfirm(
    {
      title: 'Suspend ' + name + '?',
      message: 'The user will lose access until restored.',
      icon: '<img src="images/suspend.png" alt="suspend" style="width:40px;height:40px;">',
      continueBtnClass: 'btn-danger',
      continueBtnText: 'Suspend',
    },
    function () {
      row.style.opacity = '0.55';
      const badge = row.querySelector('.badge');
      if (badge) { badge.className = 'badge badge-progress'; badge.textContent = 'Suspended'; }
      btn.textContent   = 'Restore';
      btn.className     = 'btn-blue';
      btn.style.cssText = 'padding:5px 10px;font-size:12px;';
      btn.onclick = function () { restoreUser(btn); };
    }
  );
}

// ── Restore user ──────────────────────────────────────
function restoreUser(btn) {
  const row       = btn.closest('tr');
  const nameEl    = row.querySelector('td:first-child').cloneNode(true);
  const avatarDiv = nameEl.querySelector('.avatar');
  if (avatarDiv) avatarDiv.remove();
  const name = nameEl.textContent.trim();

  showConfirm(
    {
      title: 'Restore ' + name + '?',
      message: 'The user will regain full access to the platform.',
      icon: '<img src="images/Restore.png" alt="restore" style="width:40px;height:40px;object-fit:contain;">',
      continueBtnClass: 'btn-blue',
      continueBtnText: 'Restore',
    },
    function () {
      row.style.opacity = '1';
      const badge = row.querySelector('.badge');
      if (badge) { badge.className = 'badge badge-open'; badge.textContent = 'Active'; }
      btn.textContent   = 'Suspend';
      btn.className     = 'btn-danger';
      btn.style.cssText = 'padding:5px 10px;font-size:12px;';
      btn.onclick = function () { suspendUser(btn); };
    }
  );
}

// ── Delete row ────────────────────────────────────────
function removeRow(btn) {
  showConfirm(
    {
      title: 'Delete this entry?',
      message: 'This request will be permanently removed and cannot be undone.',
      icon: '<img src="images/Delete.png" alt="delete" style="width:40px;height:40px;object-fit:contain;">',
      continueBtnClass: 'btn-danger',
      continueBtnText: 'Delete',
    },
    function () {
      const row = btn.closest('tr');
      row.style.transition = 'opacity 0.3s, transform 0.3s';
      row.style.opacity    = '0';
      row.style.transform  = 'translateX(20px)';
      setTimeout(function () { row.remove(); }, 300);
    }
  );
}

// ── Filter inbox messages ─────────────────────────────
function filterMessages() {
  const status = document.getElementById('msg-status-filter').value.toLowerCase();
  document.querySelectorAll('#inbox-list .inbox-card').forEach(function (card) {
    const cardStatus = card.getAttribute('data-status');
    card.style.display = (status === '' || cardStatus === status) ? '' : 'none';
  });
}

// ── Mark message as read ──────────────────────────────
function markRead(btn) {
  const card  = btn.closest('.inbox-card');
  const badge = card.querySelector('.badge');
  if (badge) { badge.className = 'badge badge-completed'; badge.textContent = 'Read'; }
  card.classList.remove('unread');
  card.setAttribute('data-status', 'read');
  btn.remove();
}

// ── Delete inbox message ──────────────────────────────
function deleteMessage(btn) {
  showConfirm(
    {
      title: 'Delete this message?',
      message: 'This message will be permanently removed.',
      icon: '<img src="images/Delete.png" alt="delete" style="width:40px;height:40px;object-fit:contain;">',
      continueBtnClass: 'btn-danger',
      continueBtnText: 'Delete',
    },
    function () {
      const card = btn.closest('.inbox-card');
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      card.style.opacity    = '0';
      card.style.transform  = 'translateX(20px)';
      setTimeout(function () { card.remove(); }, 300);
    }
  );
}

// ── Toggle reply area ─────────────────────────────────
function toggleReply(btn) {
  const card      = btn.closest('.inbox-card');
  const replyArea = card.querySelector('.inbox-reply-area');
  const isVisible = replyArea.style.display !== 'none';
  replyArea.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) card.querySelector('.inbox-reply-input').focus();
}

// ── Cancel reply ──────────────────────────────────────
function cancelReply(btn) {
  const card      = btn.closest('.inbox-card');
  const replyArea = card.querySelector('.inbox-reply-area');
  card.querySelector('.inbox-reply-input').value = '';
  replyArea.style.display = 'none';
}

// ── Send reply ────────────────────────────────────────
function sendReply(btn) {
  const card       = btn.closest('.inbox-card');
  const input      = card.querySelector('.inbox-reply-input');
  const text       = input.value.trim();
  if (!text) return;

  const replyArea  = card.querySelector('.inbox-reply-area');
  const replySent  = card.querySelector('.inbox-reply-sent');
  const now        = new Date();
  const timeStr    = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                   + ' at ' + now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });

  replySent.innerHTML = `<div class="reply-label">✅ Replied by Community Help Hub Support Team · ${timeStr}</div>${text}`;
  replySent.style.display = 'block';
  input.value = '';
  replyArea.style.display = 'none';

  // Also mark as read automatically after replying
  const badge = card.querySelector('.badge');
  if (badge && badge.textContent === 'Unread') {
    badge.className = 'badge badge-completed';
    badge.textContent = 'Read';
    card.classList.remove('unread');
    card.setAttribute('data-status', 'read');
    const markReadBtn = card.querySelector('.btn-ghost');
    if (markReadBtn && markReadBtn.textContent === 'Mark Read') markReadBtn.remove();
  }
}
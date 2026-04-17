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

// ── Filter table rows ─────────────────────────────────
function filterTable(tableId, searchVal) {
  const val = searchVal.toLowerCase();
  document.querySelectorAll('#' + tableId + ' tbody tr').forEach(function (row) {
    row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
  });
}

// ── View row details ──────────────────────────────────
function viewRow(btn) {
  const row    = btn.closest('tr');
  const cells  = row.querySelectorAll('td');
  const isUsers = row.closest('table').id === 'users-table';
  const body   = document.getElementById('view-modal-body');

  let html = '<div class="view-grid">';

  if (isUsers) {
    const nameEl = cells[0].cloneNode(true);
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
  const row    = btn.closest('tr');
  const nameEl = row.querySelector('td:first-child').cloneNode(true);
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
      btn.textContent = 'Restore';
      btn.className   = 'btn-blue';
      btn.style.cssText = 'padding:5px 10px;font-size:12px;';
      btn.onclick = function () { restoreUser(btn); };
    }
  );
}

// ── Restore user ──────────────────────────────────────
function restoreUser(btn) {
  const row    = btn.closest('tr');
  const nameEl = row.querySelector('td:first-child').cloneNode(true);
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
      btn.textContent = 'Suspend';
      btn.className   = 'btn-danger';
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
      row.style.transition  = 'opacity 0.3s, transform 0.3s';
      row.style.opacity     = '0';
      row.style.transform   = 'translateX(20px)';
      setTimeout(function () { row.remove(); }, 300);
    }
  );
}
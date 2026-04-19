let currentUserId = 101;
let requestsData = JSON.parse(localStorage.getItem("requestsData")) || {};
let helpRequests = JSON.parse(localStorage.getItem("helpRequests")) || [];

const saveAll = () => {
  localStorage.setItem("requestsData", JSON.stringify(requestsData));
  localStorage.setItem("helpRequests", JSON.stringify(helpRequests));
};

function loadPendingHelpers() {
  const container = document.getElementById("pending-helpers");
  if (!container) return;
  container.innerHTML = "";
  helpRequests
    .filter(r => r.ownerId == currentUserId && r.status === "pending")
    .forEach(r => {
      const div = document.createElement("div");
      div.className = "pending-offer-card";
      div.innerHTML = `
        <div class="pending-offer-avatar">${String(r.helperId).slice(0,2)}</div>
        <div class="pending-offer-info">
          <p class="pending-offer-name">User ${r.helperId}</p>
          <p class="pending-offer-sub">Wants to help with your request</p>
        </div>
        <div class="pending-offer-actions">
          <button class="btn-confirm" onclick="confirmHelp(${r.id})">Confirm</button>
          <button class="btn-reject"  onclick="rejectHelp(${r.id})">Reject</button>
        </div>`;
      container.appendChild(div);
    });
}

function confirmHelp(id) {
  const req = helpRequests.find(r => r.id == id);
  if (!req) return;
  req.status = "accepted";
  helpRequests.forEach(r => { if (r.requestId == req.requestId && r.id != id) r.status = "rejected"; });
  requestsData[req.requestId].status = "In Progress";
  saveAll();
  alert("Helper confirmed!");
  location.href = `messages.html?user=${req.helperId}&request=${req.requestId}`;
}

function rejectHelp(id) {
  const req = helpRequests.find(r => r.id == id);
  if (req) { req.status = "rejected"; saveAll(); loadPendingHelpers(); }
}

loadPendingHelpers();

function switchTab(tab) {
  document.getElementById('panel-posted').style.display  = tab === 'posted'  ? 'flex' : 'none';
  document.getElementById('panel-helping').style.display = tab === 'helping' ? 'flex' : 'none';
  document.getElementById('tab-posted').classList.toggle('active',  tab === 'posted');
  document.getElementById('tab-helping').classList.toggle('active', tab === 'helping');
}
document.getElementById('panel-posted').style.display = 'flex';

function markCompleted(btn) {
  const item = btn.closest('.my-req-item');
  const badge = item.querySelector('.badge');
  badge.className = 'badge badge-completed';
  badge.textContent = 'Completed';
  btn.closest('.my-req-actions').innerHTML = '<p style="font-size:13px;color:var(--text-gray);">Marked as completed</p>';
}

/* ── Pop-in keyframe ── */
const _style = document.createElement('style');
_style.textContent = `@keyframes popIn { from { transform:scale(0.88) translateY(16px); opacity:0; } to { transform:scale(1) translateY(0); opacity:1; } }`;
document.head.appendChild(_style);

/* ── Shared modal builder ── */
function showConfirmModal({ icon, iconBg, title, message, cancelLabel, confirmLabel, confirmBg, confirmHover, onConfirm }) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.id = 'popup-modal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:40px 36px;max-width:420px;width:90%;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.18);animation:popIn .25s cubic-bezier(.34,1.56,.64,1);">
      <div style="width:64px;height:64px;border-radius:50%;background:${iconBg};display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:30px;">${icon}</div>
      <h3 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 10px;">${title}</h3>
      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 28px;">${message}</p>
      <div style="display:flex;gap:12px;">
        <button id="modal-cancel-btn" style="flex:1;padding:13px 0;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;background:#f3f4f6;color:#374151;border:1.5px solid #e5e7eb;">${cancelLabel}</button>
        <button id="modal-confirm-btn" style="flex:1;padding:13px 0;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;background:${confirmBg};color:#fff;border:none;">${confirmLabel}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#modal-cancel-btn').onclick = closeModal;
  overlay.querySelector('#modal-confirm-btn').onclick = () => { closeModal(); onConfirm(); };
  overlay.querySelector('#modal-confirm-btn').onmouseenter = function() { this.style.background = confirmHover; };
  overlay.querySelector('#modal-confirm-btn').onmouseleave = function() { this.style.background = confirmBg; };
  overlay.onclick = e => { if (e.target === overlay) closeModal(); };
}

function closeModal() {
  const m = document.getElementById('popup-modal');
  if (m) m.remove();
}

/* ── Cancel Request ── */
function cancelRequest(btn) {
  const item = btn.closest('.my-req-item');
  showConfirmModal({
    icon: '🚫',
    iconBg: '#fef2f2',
    title: 'Cancel Request?',
    message: 'This will permanently delete your request. Volunteers who offered to help will be notified. This action cannot be undone.',
    cancelLabel: 'Keep Request',
    confirmLabel: 'Cancel Request',
    confirmBg: '#dc2626',
    confirmHover: '#b91c1c',
    onConfirm: () => removeCard(item)
  });
}

/* ── Withdraw ── */
function withdraw(btn) {
  const item = btn.closest('.my-req-item');
  showConfirmModal({
    icon: '↩️',
    iconBg: '#fff7ed',
    title: 'Withdraw from Request?',
    message: 'You will be removed as a helper. The request owner will be notified and can accept another volunteer.',
    cancelLabel: 'Stay',
    confirmLabel: 'Withdraw',
    confirmBg: '#ea580c',
    confirmHover: '#c2410c',
    onConfirm: () => removeCard(item)
  });
}

/* ── Shared card-removal animation ── */
function removeCard(item) {
  if (!item) return;
  Object.assign(item.style, { transition:'all .4s ease', opacity:'0', transform:'scale(0.95)' });
  setTimeout(() => item.remove(), 400);
}

/* ── Edit ── */
function editRequest(btn) {
  const item = btn.closest('.my-req-item');
  if (item.querySelector('.edit-form')) return;
  const get = sel => item.querySelector(sel);
  const titleEl = get('.req-title'), locationEl = get('.req-location'), dateEl = get('.req-date');
  const actions = get('.my-req-actions');
  actions.style.display = 'none';

  const form = document.createElement('div');
  form.className = 'edit-form';
  form.innerHTML = `
    <div class="edit-form-inner">
      <label class="edit-label">Title</label>
      <input class="edit-input" id="edit-title"    type="text" value="${titleEl?.textContent.trim() || ''}"/>
      <label class="edit-label">Location</label>
      <input class="edit-input" id="edit-location" type="text" value="${locationEl?.textContent.trim() || ''}"/>
      <label class="edit-label">Date & Time</label>
      <input class="edit-input" id="edit-date"     type="text" value="${dateEl?.textContent.trim() || ''}"/>
      <div class="edit-form-actions">
        <button class="btn-ghost" onclick="cancelEdit(this)">Cancel</button>
        <button class="btn-blue"  onclick="saveEdit(this)">Save Changes</button>
      </div>
    </div>`;
  Object.assign(form, { _originalActions: actions, _titleEl: titleEl, _locationEl: locationEl, _dateEl: dateEl });
  item.appendChild(form);
}

function cancelEdit(btn) {
  const form = btn.closest('.edit-form');
  form._originalActions.style.display = '';
  form.remove();
}

function saveEdit(btn) {
  const form = btn.closest('.edit-form');
  const val  = id => form.querySelector(id).value.trim();
  if (form._titleEl    && val('#edit-title'))    form._titleEl.textContent    = val('#edit-title');
  if (form._locationEl && val('#edit-location')) form._locationEl.textContent = val('#edit-location');
  if (form._dateEl     && val('#edit-date'))     form._dateEl.textContent     = val('#edit-date');
  form._originalActions.style.display = '';
  showToast('Request updated successfully!');
  form.remove();
}

/* ── Toast ── */
function showToast(msg) {
  const t = Object.assign(document.createElement('div'), { className:'toast-notification', textContent:msg });
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 3000);
}
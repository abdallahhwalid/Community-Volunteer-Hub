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
 
/* ── Cancel modal ── */
function cancelRequest(btn) { showCancelModal(btn.closest('.my-req-item')); }
 
function showCancelModal(item) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3 class="modal-title">Cancel Request?</h3>
      <p class="modal-message">This will permanently delete your request. Volunteers who offered to help will be notified. This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="modal-btn-keep"   onclick="closeModal()">Keep Request</button>
        <button class="modal-btn-cancel" onclick="confirmCancel(this)">Yes, Cancel It</button>
      </div>
    </div>`;
  overlay._targetItem = item;
  document.body.appendChild(overlay);
}
 
function closeModal() {
  const overlay = document.querySelector('.modal-overlay:not(#offer-modal)');
  if (overlay) overlay.remove();
}
 
function confirmCancel(btn) {
  const item = btn.closest('.modal-overlay')._targetItem;
  closeModal();
  removeCard(item);
}
 
/* ── Withdraw: now deletes the card ── */
function withdraw(btn) {
  if (confirm('Are you sure you want to withdraw from this request?'))
    removeCard(btn.closest('.my-req-item'));
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
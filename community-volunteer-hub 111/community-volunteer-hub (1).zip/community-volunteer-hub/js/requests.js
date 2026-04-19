let currentUserId = 999;
let activeRequestId = null;
 
const owners = {
  1: { name: "Sarah Miller",  rating: "4.8" },
  2: { name: "Ahmed Ali",     rating: "4.9" },
  3: { name: "Michael J.",    rating: "4.7" },
  4: { name: "John Doe",      rating: "4.5" },
  5: { name: "Emily S.",      rating: "5.0" },
  6: { name: "Mark K.",       rating: "4.6" }
};
 
let requestsData = JSON.parse(localStorage.getItem("requestsData")) || {
  1: { status: "Open",        ownerId: 101 },
  2: { status: "Open",        ownerId: 102 },
  3: { status: "In Progress", ownerId: 103 }
};
 
let helpRequests = JSON.parse(localStorage.getItem("helpRequests")) || [];
 
const saveAll = () => {
  localStorage.setItem("requestsData", JSON.stringify(requestsData));
  localStorage.setItem("helpRequests", JSON.stringify(helpRequests));
};
 
/* ── Login required modal ── */
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
 
/* ── Offer Modal ── */
function openOfferModal(requestId) {
  if (!localStorage.getItem('userName')) {
    showLoginPrompt();
    return;
  }
 
  activeRequestId = requestId;
  const card = document.querySelector(`.req-card[data-id="${requestId}"]`);
 
  document.getElementById('modal-title').innerText     = card.querySelector('h3').innerText;
  document.getElementById('modal-category').innerText  = card.querySelector('.req-category').innerText;
  document.getElementById('modal-desc').innerText      = card.querySelector('.req-desc').innerText;
  document.getElementById('modal-location').innerText  = card.querySelectorAll('.meta-info')[0].innerText;
  document.getElementById('modal-time-orig').innerText = card.querySelectorAll('.meta-info')[1].innerText;
  document.getElementById('modal-user').innerText      = owners[requestId].name;
  document.getElementById('suggested-time').value      = '';
 
  document.getElementById('offer-modal').style.display = 'flex';
}
 
function closeOfferModal() {
  document.getElementById('offer-modal').style.display = 'none';
}
 
function confirmHelp() {
  const suggestedTime = document.getElementById('suggested-time').value;
  if (!suggestedTime) {
    document.getElementById('suggested-time').style.borderColor = '#dc2626';
    document.getElementById('suggested-time').focus();
    return;
  }
  document.getElementById('suggested-time').style.borderColor = '';
 
  helpRequests.push({
    id: Date.now(), requestId: activeRequestId,
    helperId: currentUserId, suggestedTime, status: "pending"
  });
  saveAll();
  closeOfferModal();
  const ownerName = owners[activeRequestId].name;
  location.href = "messages.html?autoMsg=true&datetime=" + encodeURIComponent(suggestedTime) + "&user=" + encodeURIComponent(ownerName);
}
 
/* ── Disable Offer Help buttons for In Progress requests ── */
function updateOfferButtons() {
  document.querySelectorAll('.req-card').forEach(card => {
    const id  = card.dataset.id;
    const btn = card.querySelector('.btn-offer');
    if (!btn) return;
    const status = requestsData[id]?.status;
    if (status === 'In Progress') {
      btn.disabled = true;
      btn.textContent = 'In Progress';
      btn.style.cssText = 'background:#e5e7eb;color:#9ca3af;cursor:not-allowed;opacity:1;';
      btn.onclick = null;
    } else {
      btn.disabled = false;
      btn.textContent = 'Offer Help';
      btn.style.cssText = '';
      btn.onclick = () => openOfferModal(Number(id));
    }
  });
}
 
updateOfferButtons();
 
/* ── Filter / Search ── */
function filterRequests() {
  const searchVal = document.getElementById('search-input').value.toLowerCase().trim();
  const catVal    = document.getElementById('category-filter').value;
  const statusVal = document.getElementById('status-filter').value;
 
  let count = 0;
  document.querySelectorAll('.req-card').forEach(card => {
    const title       = card.querySelector('h3').textContent.toLowerCase();
    const matchSearch = !searchVal || title.includes(searchVal);
    const matchCat    = !catVal    || card.dataset.category === catVal;
    const matchStatus = !statusVal || card.dataset.status   === statusVal;
    const show = matchSearch && matchCat && matchStatus;
    card.style.display = show ? '' : 'none';
    if (show) count++;
  });
 
  const counter = document.getElementById('results-count');
  if (counter) counter.textContent = `Showing ${count} request${count !== 1 ? 's' : ''}`;
}
 
/* ── Event listeners ── */
document.getElementById('search-input')?.addEventListener('input',  filterRequests);
document.getElementById('search-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') filterRequests(); });
document.getElementById('search-btn')?.addEventListener('click', filterRequests);
document.getElementById('category-filter')?.addEventListener('change', filterRequests);
document.getElementById('status-filter')?.addEventListener('change', filterRequests);
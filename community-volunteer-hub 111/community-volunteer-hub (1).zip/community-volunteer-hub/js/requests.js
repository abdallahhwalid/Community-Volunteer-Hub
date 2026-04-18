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
  3: { status: "In Progress", ownerId: 103 },
  4: { status: "Open",        ownerId: 104 },
  5: { status: "Open",        ownerId: 105 },
  6: { status: "Open",        ownerId: 106 }
};

let helpRequests = JSON.parse(localStorage.getItem("helpRequests")) || [];

const saveAll = () => {
  localStorage.setItem("requestsData", JSON.stringify(requestsData));
  localStorage.setItem("helpRequests", JSON.stringify(helpRequests));
};

/* ── Offer Modal ── */
function openOfferModal(requestId) {
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
    const title    = card.querySelector('h3').textContent.toLowerCase();
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
// MY REQUESTS PAGE JAVASCRIPT
let currentUserId = 101; // ده صاحب الطلب

let requestsData = JSON.parse(localStorage.getItem("requestsData")) || {};
let helpRequests = JSON.parse(localStorage.getItem("helpRequests")) || [];

function saveAll() {
  localStorage.setItem("requestsData", JSON.stringify(requestsData));
  localStorage.setItem("helpRequests", JSON.stringify(helpRequests));
}
function loadPendingHelpers() {
  let container = document.getElementById("pending-helpers");
  if (!container) return;

  container.innerHTML = "";

  let myPending = helpRequests.filter(r =>
    r.ownerId == currentUserId && r.status === "pending"
  );

  myPending.forEach(r => {
    let div = document.createElement("div");

    div.innerHTML = `
      <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
        <p>👤 User ${r.helperId} wants to help</p>
        <button onclick="confirmHelp(${r.id})">✅ Confirm</button>
        <button onclick="rejectHelp(${r.id})">❌ Reject</button>
      </div>
    `;

    container.appendChild(div);
  });
}
function confirmHelp(id) {
  let req = helpRequests.find(r => r.id == id);

  if (!req) return;

  // ✅ Accept
  req.status = "accepted";

  // ❌ Reject باقي الناس
  helpRequests.forEach(r => {
    if (r.requestId == req.requestId && r.id != id) {
      r.status = "rejected";
    }
  });

  // 🔒 نغير حالة الطلب
  requestsData[req.requestId].status = "In Progress";

  saveAll();

  alert("Helper confirmed!");

  // 💬 فتح chat صح (مش Sarah Johnson 😏)
  window.location.href = `messages.html?user=${req.helperId}&request=${req.requestId}`;
}

function rejectHelp(id) {
  let req = helpRequests.find(r => r.id == id);

  if (!req) return;

  req.status = "rejected";
  saveAll();

  loadPendingHelpers();
} 

loadPendingHelpers();
function switchTab(tab) {
  document.getElementById('panel-posted').style.display = tab === 'posted' ? 'block' : 'none';
  document.getElementById('panel-helping').style.display = tab === 'helping' ? 'block' : 'none';
  document.getElementById('tab-posted').classList.toggle('active', tab === 'posted');
  document.getElementById('tab-helping').classList.toggle('active', tab === 'helping');
}

function markCompleted(btn) {
  const item = btn.closest('.my-req-item');
  const badge = item.querySelector('.badge');
  badge.className = 'badge badge-completed';
  badge.textContent = 'Completed';
  btn.closest('.my-req-actions').innerHTML = '<p style="font-size:13px;color:var(--text-gray);">✅ Marked as completed</p>';
}

function cancelRequest(btn) {
  if (confirm('Are you sure you want to cancel this request?')) {
    btn.closest('.my-req-item').style.opacity = '0.4';
    btn.closest('.my-req-item').style.pointerEvents = 'none';
  }
}

function withdraw(btn) {
  if (confirm('Are you sure you want to withdraw from this request?')) {
    btn.closest('.my-req-item').style.opacity = '0.4';
    btn.closest('.my-req-item').style.pointerEvents = 'none';
  }
}

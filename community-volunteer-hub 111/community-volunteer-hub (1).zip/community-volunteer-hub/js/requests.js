let currentUserId = 999;
let activeRequestId = null;

// Mock data for who owns each request (to show in the modal)
const owners = {
  1: { name: "Sarah Miller", rating: "4.8" },
  2: { name: "Ahmed Ali", rating: "4.9" },
  3: { name: "Michael J.", rating: "4.7" },
  4: { name: "John Doe", rating: "4.5" },
  5: { name: "Emily S.", rating: "5.0" },
  6: { name: "Mark K.", rating: "4.6" }
};

let requestsData = JSON.parse(localStorage.getItem("requestsData")) || {
  1: { status: "Open", ownerId: 101 },
  2: { status: "Open", ownerId: 102 },
  3: { status: "In Progress", ownerId: 103 },
  4: { status: "Open", ownerId: 104 },
  5: { status: "Open", ownerId: 105 },
  6: { status: "Open", ownerId: 106 }
};

let helpRequests = JSON.parse(localStorage.getItem("helpRequests")) || [];

function saveAll() {
  localStorage.setItem("requestsData", JSON.stringify(requestsData));
  localStorage.setItem("helpRequests", JSON.stringify(helpRequests));
}

// OPEN THE OFFER MODAL
function openOfferModal(requestId) {
  const reqStatus = requestsData[requestId]?.status;
  if (reqStatus !== "Open") {
    alert("This request is no longer open!");
    return;
  }

  activeRequestId = requestId;
  const card = document.querySelector(`.req-card[data-id="${requestId}"]`);
  
  // Get data from card
  const title = card.querySelector('h3').innerText;
  const cat = card.querySelector('.req-category').innerText;
  const desc = card.querySelector('.req-desc').innerText;
  const loc = card.querySelectorAll('.meta-info')[0].innerText;
  const time = card.querySelectorAll('.meta-info')[1].innerText;

  // Fill Modal
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-category').innerText = cat;
  document.getElementById('modal-desc').innerText = desc;
  document.getElementById('modal-location').innerText = loc;
  document.getElementById('modal-time-orig').innerText = time;
  document.getElementById('modal-user').innerText = owners[requestId].name;

  // Show Modal
  document.getElementById('offer-modal').style.display = 'flex';
}

function closeOfferModal() {
  document.getElementById('offer-modal').style.display = 'none';
}

function confirmHelp() {
  const suggestedTime = document.getElementById('suggested-time').value;
  
  if(!suggestedTime) {
    alert("Please set a convenient time first!");
    return;
  }

  helpRequests.push({
    id: Date.now(),
    requestId: activeRequestId,
    helperId: currentUserId,
    suggestedTime: suggestedTime,
    status: "pending"
  });

  saveAll();
  closeOfferModal();
  
  // Get the owner's name to pass to the messages page
  const ownerName = owners[activeRequestId].name;
  
  // Redirect to messages with time and user in the URL
  window.location.href = "messages.html?autoMsg=true&datetime=" + encodeURIComponent(suggestedTime) + "&user=" + encodeURIComponent(ownerName);
}

// --- FILTER LOGIC ---
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn'); // The clickable icon
const categoryFilter = document.getElementById('category-filter');
const statusFilter = document.getElementById('status-filter');
const cards = document.querySelectorAll('.req-card');

function filterRequests() {
  const searchVal = searchInput.value.toLowerCase();
  const catVal = categoryFilter.value;
  const statusVal = statusFilter.value;

  let visibleCount = 0;

  cards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const category = card.dataset.category;
    const status = card.dataset.status;

    const matchSearch = title.includes(searchVal);
    const matchCat = !catVal || category === catVal;
    const matchStatus = !statusVal || status === statusVal;

    if (matchSearch && matchCat && matchStatus) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Update the "Showing X requests" text
  const resultsCountText = document.getElementById('results-count');
  if (resultsCountText) {
    resultsCountText.textContent = `Showing ${visibleCount} requests`;
  }
}

// 1. Search when the Search Icon is clicked
if (searchBtn) {
  searchBtn.addEventListener('click', filterRequests);
}

// 2. Search when "Enter" is pressed inside the input
if (searchInput) {
  searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      filterRequests();
    }
  });
}

// 3. Keep the dropdowns automatically filtering when changed
if (categoryFilter) {
  categoryFilter.addEventListener('change', filterRequests);
}
if (statusFilter) {
  statusFilter.addEventListener('change', filterRequests);
}
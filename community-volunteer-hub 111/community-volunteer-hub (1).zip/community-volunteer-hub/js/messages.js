// MESSAGES PAGE JAVASCRIPT

window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('autoMsg') === 'true') {
    const datetimeVal = urlParams.get('datetime');
    const userName = urlParams.get('user'); 
    
    if (datetimeVal) {
      const dateObj = new Date(datetimeVal);
      const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'long' });
      const timeString = dateObj.toLocaleTimeString(undefined, { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });

      const autoMessage = "Hi! I saw your request and I can help on " + dayName + " at " + timeString + " 😊";

      // Change the contact name and avatar initials based on the user from the URL
      if (userName) {
         document.getElementById('chat-contact-name').textContent = userName;
         
         const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
         const avatarElement = document.querySelector('.chat-panel-header .avatar');
         if(avatarElement) {
             avatarElement.textContent = initials;
         }
      }

      setTimeout(() => {
        const container = document.getElementById('chat-messages');
        const input = document.getElementById('msg-input');
        
        if (container && input) {
            container.innerHTML = ''; // Clear old chat history
            input.value = autoMessage;
            sendMessage();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 500); 
    }
  }
};

function sendMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  
  if (!text) return;

  const container = document.getElementById('chat-messages');
  
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const timeDisplay = hours + ':' + minutes + ' ' + ampm;

  const msg = document.createElement('div');
  msg.className = 'msg msg-sent';
  msg.innerHTML = '<div class="bubble bubble-sent">' + text + '</div><span class="msg-time">' + timeDisplay + '</span>';
  container.appendChild(msg);

  // ── Update sidebar preview with last sent message ──
  const activeConv = document.querySelector('.conv-item.active');
  if (activeConv) {
    const preview = activeConv.querySelector('.conv-preview');
    if (preview) preview.textContent = text;

    const timeEl = activeConv.querySelector('.conv-time');
    if (timeEl) timeEl.textContent = timeDisplay;
  }

  input.value = '';
  container.scrollTop = container.scrollHeight;
}

document.getElementById('msg-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault(); 
    sendMessage();
  }
});

function openConv(el, name, initials, status) {
  document.querySelectorAll('.conv-item').forEach(function(i) { i.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('chat-contact-name').textContent = name;
  document.getElementById('chat-contact-status').textContent = status;
  const container = document.getElementById('chat-messages');
  container.innerHTML = '<p style="text-align:center; color:var(--text-gray); font-size:13px; margin:auto;">Start of your conversation with ' + name + '</p>';
}

function filterConversations() {
  const val = document.getElementById('conv-search').value.toLowerCase();
  document.querySelectorAll('.conv-item').forEach(function(item) {
    const name = item.querySelector('.conv-name').textContent.toLowerCase();
    item.style.display = name.includes(val) ? 'flex' : 'none';
  });
}

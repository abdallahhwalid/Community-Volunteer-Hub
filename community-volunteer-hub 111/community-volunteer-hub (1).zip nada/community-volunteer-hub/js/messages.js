// MESSAGES PAGE JAVASCRIPT

function sendMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;

  const container = document.getElementById('chat-messages');
  const now = new Date();
  const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');

  const msg = document.createElement('div');
  msg.className = 'msg msg-sent';
  msg.innerHTML = '<div class="bubble bubble-sent">' + text + '</div><span class="msg-time">' + time + '</span>';
  container.appendChild(msg);

  input.value = '';
  container.scrollTop = container.scrollHeight;
}

// Send on Enter key
document.getElementById('msg-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') sendMessage();
});

// Switch conversation
function openConv(el, name, initials, status) {
  document.querySelectorAll('.conv-item').forEach(function(i) { i.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('chat-contact-name').textContent = name;
  document.getElementById('chat-contact-status').textContent = status;
  // Clear messages and show a placeholder
  const container = document.getElementById('chat-messages');
  container.innerHTML = '<p style="text-align:center; color:var(--text-gray); font-size:13px; margin:auto;">Start of your conversation with ' + name + '</p>';
}

// Filter conversations by search
function filterConversations() {
  const val = document.getElementById('conv-search').value.toLowerCase();
  document.querySelectorAll('.conv-item').forEach(function(item) {
    const name = item.querySelector('.conv-name').textContent.toLowerCase();
    item.style.display = name.includes(val) ? 'flex' : 'none';
  });
}

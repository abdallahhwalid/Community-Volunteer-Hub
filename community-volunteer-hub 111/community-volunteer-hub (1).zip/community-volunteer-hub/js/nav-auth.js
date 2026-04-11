window.addEventListener('DOMContentLoaded', () => {
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const authDiv = document.querySelector('.nav-icons');

  if (!authDiv) return;

  if (userName) {
    authDiv.innerHTML = `
      <a href="messages.html" class="nav-icon-btn">💬</a>
      <a href="profile.html" class="nav-icon-btn">👤</a>
      ${userRole === 'Admin' ? '<a href="admin.html" class="btn-secondary" style="margin-left:8px; padding:8px 14px; font-size:14px;">Manage</a>' : ''}
      <span style="font-weight:600; color:var(--navy); margin-left:10px;">Hi, ${userName.split(' ')[0]}</span>
      <a href="#" onclick="localStorage.clear(); location.reload();" style="font-size:12px; margin-left:10px; color:red;">Logout</a>
    `;
  }
});

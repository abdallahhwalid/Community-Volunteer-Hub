window.addEventListener('DOMContentLoaded', () => {
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const authDiv = document.querySelector('.nav-icons');

  if (!authDiv) return;

  if (userName) {
    authDiv.innerHTML = `
      <a href="messages.html" class="nav-icon-btn">
      <img src="images/messages1.png" alt="messages" style="width:20px;height:20px;">
      </a>
      <a href="profile.html" class="nav-icon-btn">
      <img src="images/profile.png" alt="profile" style="width:25px;height:25px;">
      </a>
      ${userRole === 'Admin' ? '<a href="admin.html" class="btn-secondary" style="margin-left:8px; padding:8px 14px; font-size:14px;">Manage</a>' : ''}
      <span style="font-weight:600; color:var(--navy); margin-left:10px;">Hi, ${userName.split(' ')[0]}</span>
      <a href="#" onclick="localStorage.clear(); location.reload();" style="font-size:12px; margin-left:10px; color:red;">Logout</a>
    `;
  }
});

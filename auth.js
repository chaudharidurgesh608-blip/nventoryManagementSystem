// Authentication and Session Management

function saveSession(authResponse) {
  if (authResponse && authResponse.token) {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('email', authResponse.email || '');
    localStorage.setItem('fullName', authResponse.fullName || '');
    localStorage.setItem('role', authResponse.role || 'User');
  }
}

function clearSession() {
  localStorage.clear();
  window.location.href = 'login.html';
}

function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function getUserRole() {
  return localStorage.getItem('role') || 'Guest';
}

function getUserName() {
  return localStorage.getItem('fullName') || localStorage.getItem('email') || 'User';
}

function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
  }
}

function requireAdmin() {
  requireAuth();
  if (getUserRole() !== 'Admin') {
    alert('Access Denied: Admin privileges required.');
    window.location.href = 'dashboard.html';
  }
}

// Update navbar links based on authentication state
document.addEventListener('DOMContentLoaded', () => {
  const authContainer = document.getElementById('navbar-auth-section');
  if (!authContainer) return;

  if (isAuthenticated()) {
    authContainer.innerHTML = `
      <span class="text-light me-3 d-flex align-items-center">
        <i class="bi bi-person-circle me-2"></i> ${getUserName()} 
        <span class="badge bg-primary ms-2">${getUserRole()}</span>
      </span>
      <button onclick="clearSession()" class="btn btn-outline-danger btn-sm">
        <i class="bi bi-box-arrow-right"></i> Logout
      </button>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="login.html" class="btn btn-outline-light btn-sm me-2">
        <i class="bi bi-box-arrow-in-right"></i> Login
      </a>
      <a href="register.html" class="btn btn-primary btn-sm">
        <i class="bi bi-person-plus"></i> Register
      </a>
    `;
  }
});

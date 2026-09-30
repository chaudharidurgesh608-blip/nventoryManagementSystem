// User Management Logic (Admin only)

document.addEventListener('DOMContentLoaded', async () => {
  requireAdmin(); // Enforce Admin-only access

  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Loading users...</td></tr>`;

  try {
    const users = await apiRequest('/users', 'GET', null, true);

    if (!users || users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No registered users found.</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map((u, index) => {
      const isAdmin = u.role === 'Admin';
      const roleBadge = isAdmin ? 'bg-primary' : 'bg-secondary';
      const icon = isAdmin ? 'bi-shield-check' : 'bi-person';

      return `
        <tr>
          <td><span class="badge bg-light text-dark border">#${index + 1}</span></td>
          <td class="fw-bold">${u.fullName}</td>
          <td><i class="bi bi-envelope text-info me-1"></i> ${u.email}</td>
          <td>
            <span class="badge ${roleBadge} px-2 py-1">
              <i class="bi ${icon} me-1"></i> ${u.role}
            </span>
          </td>
          <td class="small text-muted">${new Date(u.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error loading users: ${err.message}</td></tr>`;
  }
});

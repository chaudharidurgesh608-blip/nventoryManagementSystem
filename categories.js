// Categories Management Logic

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  await loadCategories();

  document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
});

async function loadCategories() {
  const tbody = document.getElementById('categories-tbody');
  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Loading categories...</td></tr>`;

  try {
    const categories = await apiRequest('/categories');

    if (!categories || categories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No categories created yet. Click "+ Add Category" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = categories.map(c => `
      <tr>
        <td><span class="badge bg-light text-dark border">#${c.categoryId}</span></td>
        <td class="fw-bold">${c.categoryName}</td>
        <td class="text-muted">${c.description || '-'}</td>
        <td>
          <span class="badge bg-primary-subtle text-primary border px-2 py-1">
            <i class="bi bi-box-seam me-1"></i> ${c.productCount} Products
          </span>
        </td>
        <td class="small text-muted">${new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="openEditModal(${JSON.stringify(c).replace(/"/g, '&quot;')})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="deleteCategory(${c.categoryId}, '${c.categoryName}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Error loading categories: ${err.message}</td></tr>`;
  }
}

function openAddModal() {
  document.getElementById('categoryModalTitle').innerText = 'Add New Category';
  document.getElementById('categoryId').value = '';
  document.getElementById('categoryName').value = '';
  document.getElementById('categoryDescription').value = '';
  document.getElementById('modal-alert').className = 'alert d-none';

  const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
  modal.show();
}

function openEditModal(c) {
  document.getElementById('categoryModalTitle').innerText = 'Edit Category';
  document.getElementById('categoryId').value = c.categoryId;
  document.getElementById('categoryName').value = c.categoryName;
  document.getElementById('categoryDescription').value = c.description || '';
  document.getElementById('modal-alert').className = 'alert d-none';

  const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
  modal.show();
}

async function handleCategorySubmit(e) {
  e.preventDefault();
  const alertBox = document.getElementById('modal-alert');
  alertBox.className = 'alert d-none';

  const id = document.getElementById('categoryId').value;
  const isEdit = !!id;

  const payload = {
    categoryName: document.getElementById('categoryName').value.trim(),
    description: document.getElementById('categoryDescription').value.trim()
  };

  try {
    const endpoint = isEdit ? `/categories/${id}` : '/categories';
    const method = isEdit ? 'PUT' : 'POST';

    await apiRequest(endpoint, method, payload, true);

    bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
    await loadCategories();

  } catch (err) {
    alertBox.className = 'alert alert-danger';
    alertBox.innerText = err.message;
  }
}

async function deleteCategory(id, name) {
  if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

  try {
    await apiRequest(`/categories/${id}`, 'DELETE', null, true);
    await loadCategories();
  } catch (err) {
    alert(`Could not delete category: ${err.message}`);
  }
}

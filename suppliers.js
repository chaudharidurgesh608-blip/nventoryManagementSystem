// Suppliers Management Logic

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  await loadSuppliers();

  document.getElementById('supplierForm').addEventListener('submit', handleSupplierSubmit);
});

async function loadSuppliers() {
  const tbody = document.getElementById('suppliers-tbody');
  tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Loading suppliers...</td></tr>`;

  try {
    const suppliers = await apiRequest('/suppliers');

    if (!suppliers || suppliers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No suppliers registered yet. Click "+ Add Supplier" to register one.</td></tr>`;
      return;
    }

    tbody.innerHTML = suppliers.map(s => `
      <tr>
        <td><span class="badge bg-light text-dark border">#${s.supplierId}</span></td>
        <td class="fw-bold">${s.supplierName}</td>
        <td><i class="bi bi-telephone text-primary me-1"></i> ${s.phone || '-'}</td>
        <td><i class="bi bi-envelope text-info me-1"></i> ${s.email || '-'}</td>
        <td class="text-muted"><small>${s.address || '-'}</small></td>
        <td>
          <span class="badge bg-success-subtle text-success border px-2 py-1">
            <i class="bi bi-box-seam me-1"></i> ${s.productCount} Items
          </span>
        </td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="openEditModal(${JSON.stringify(s).replace(/"/g, '&quot;')})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="deleteSupplier(${s.supplierId}, '${s.supplierName}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Error loading suppliers: ${err.message}</td></tr>`;
  }
}

function openAddModal() {
  document.getElementById('supplierModalTitle').innerText = 'Add New Supplier';
  document.getElementById('supplierId').value = '';
  document.getElementById('supplierName').value = '';
  document.getElementById('supplierPhone').value = '';
  document.getElementById('supplierEmail').value = '';
  document.getElementById('supplierAddress').value = '';
  document.getElementById('modal-alert').className = 'alert d-none';

  const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
  modal.show();
}

function openEditModal(s) {
  document.getElementById('supplierModalTitle').innerText = 'Edit Supplier';
  document.getElementById('supplierId').value = s.supplierId;
  document.getElementById('supplierName').value = s.supplierName;
  document.getElementById('supplierPhone').value = s.phone || '';
  document.getElementById('supplierEmail').value = s.email || '';
  document.getElementById('supplierAddress').value = s.address || '';
  document.getElementById('modal-alert').className = 'alert d-none';

  const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
  modal.show();
}

async function handleSupplierSubmit(e) {
  e.preventDefault();
  const alertBox = document.getElementById('modal-alert');
  alertBox.className = 'alert d-none';

  const id = document.getElementById('supplierId').value;
  const isEdit = !!id;

  const payload = {
    supplierName: document.getElementById('supplierName').value.trim(),
    phone: document.getElementById('supplierPhone').value.trim(),
    email: document.getElementById('supplierEmail').value.trim(),
    address: document.getElementById('supplierAddress').value.trim()
  };

  try {
    const endpoint = isEdit ? `/suppliers/${id}` : '/suppliers';
    const method = isEdit ? 'PUT' : 'POST';

    await apiRequest(endpoint, method, payload, true);

    bootstrap.Modal.getInstance(document.getElementById('supplierModal')).hide();
    await loadSuppliers();

  } catch (err) {
    alertBox.className = 'alert alert-danger';
    alertBox.innerText = err.message;
  }
}

async function deleteSupplier(id, name) {
  if (!confirm(`Are you sure you want to delete supplier "${name}"?`)) return;

  try {
    await apiRequest(`/suppliers/${id}`, 'DELETE', null, true);
    await loadSuppliers();
  } catch (err) {
    alert(`Could not delete supplier: ${err.message}`);
  }
}

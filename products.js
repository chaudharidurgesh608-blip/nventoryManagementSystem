// Products Management Logic

let allCategories = [];
let allSuppliers = [];

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  await loadDropdownData();
  await loadProducts();

  // Search and Filter form listener
  document.getElementById('filter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    loadProducts();
  });

  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-status').value = '';
    loadProducts();
  });

  // Product Form (Add/Edit) submission
  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
});

async function loadDropdownData() {
  try {
    const [categories, suppliers] = await Promise.all([
      apiRequest('/categories'),
      apiRequest('/suppliers')
    ]);

    allCategories = categories || [];
    allSuppliers = suppliers || [];

    // Populate filter dropdown
    const filterCatSelect = document.getElementById('filter-category');
    filterCatSelect.innerHTML = '<option value="">All Categories</option>' + 
      allCategories.map(c => `<option value="${c.categoryId}">${c.categoryName}</option>`).join('');

    // Populate modal dropdowns
    const modalCatSelect = document.getElementById('productCategory');
    modalCatSelect.innerHTML = '<option value="">Select Category...</option>' + 
      allCategories.map(c => `<option value="${c.categoryId}">${c.categoryName}</option>`).join('');

    const modalSupSelect = document.getElementById('productSupplier');
    modalSupSelect.innerHTML = '<option value="">Select Supplier...</option>' + 
      allSuppliers.map(s => `<option value="${s.supplierId}">${s.supplierName}</option>`).join('');

  } catch (err) {
    console.error('Error loading dropdown data:', err);
  }
}

async function loadProducts() {
  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Loading products...</td></tr>`;

  const search = document.getElementById('search-input').value.trim();
  const categoryId = document.getElementById('filter-category').value;
  const status = document.getElementById('filter-status').value;

  let query = '/products?';
  if (search) query += `search=${encodeURIComponent(search)}&`;
  if (categoryId) query += `categoryId=${categoryId}&`;
  if (status) query += `status=${status}&`;

  try {
    const products = await apiRequest(query);

    if (!products || products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">No products found matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => {
      let badgeClass = 'bg-success';
      if (p.stockStatus === 'Low Stock') badgeClass = 'bg-warning text-dark';
      if (p.stockStatus === 'Out of Stock') badgeClass = 'bg-danger';

      return `
        <tr>
          <td><span class="badge bg-light text-dark border">#${p.productId}</span></td>
          <td>
            <div class="fw-bold">${p.productName}</div>
            <small class="text-muted">${p.description || '-'}</small>
          </td>
          <td><code class="fw-semibold text-primary">${p.sku}</code></td>
          <td><span class="badge bg-secondary-subtle text-secondary border">${p.categoryName}</span></td>
          <td class="small text-muted">${p.supplierName}</td>
          <td class="fw-bold text-dark">₹${Number(p.price).toLocaleString('en-IN')}</td>
          <td>
            <span class="fw-bold fs-6">${p.quantity}</span>
            <small class="text-muted d-block" style="font-size: 0.75rem;">Min: ${p.minimumStockLevel}</small>
          </td>
          <td><span class="badge ${badgeClass}">${p.stockStatus}</span></td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="openEditModal(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger" onclick="deleteProduct(${p.productId}, '${p.productName}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">Error loading products: ${err.message}</td></tr>`;
  }
}

function openAddModal() {
  document.getElementById('productModalTitle').innerText = 'Add New Product';
  document.getElementById('productId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productSku').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productQuantity').value = '10';
  document.getElementById('productMinStock').value = '5';
  document.getElementById('productCategory').value = allCategories.length ? allCategories[0].categoryId : '';
  document.getElementById('productSupplier').value = allSuppliers.length ? allSuppliers[0].supplierId : '';
  document.getElementById('modal-alert').className = 'alert d-none';

  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

function openEditModal(p) {
  document.getElementById('productModalTitle').innerText = 'Edit Product';
  document.getElementById('productId').value = p.productId;
  document.getElementById('productName').value = p.productName;
  document.getElementById('productSku').value = p.sku;
  document.getElementById('productDescription').value = p.description || '';
  document.getElementById('productPrice').value = p.price;
  document.getElementById('productQuantity').value = p.quantity;
  document.getElementById('productMinStock').value = p.minimumStockLevel;
  document.getElementById('productCategory').value = p.categoryId;
  document.getElementById('productSupplier').value = p.supplierId;
  document.getElementById('modal-alert').className = 'alert d-none';

  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const alertBox = document.getElementById('modal-alert');
  alertBox.className = 'alert d-none';

  const id = document.getElementById('productId').value;
  const isEdit = !!id;

  const payload = {
    productName: document.getElementById('productName').value.trim(),
    sku: document.getElementById('productSku').value.trim(),
    description: document.getElementById('productDescription').value.trim(),
    price: parseFloat(document.getElementById('productPrice').value),
    quantity: parseInt(document.getElementById('productQuantity').value, 10),
    minimumStockLevel: parseInt(document.getElementById('productMinStock').value, 10),
    categoryId: parseInt(document.getElementById('productCategory').value, 10),
    supplierId: parseInt(document.getElementById('productSupplier').value, 10)
  };

  try {
    const endpoint = isEdit ? `/products/${id}` : '/products';
    const method = isEdit ? 'PUT' : 'POST';

    await apiRequest(endpoint, method, payload, true);

    // Close modal and reload
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    await loadProducts();

  } catch (err) {
    alertBox.className = 'alert alert-danger';
    alertBox.innerText = err.message;
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  try {
    await apiRequest(`/products/${id}`, 'DELETE', null, true);
    await loadProducts();
  } catch (err) {
    alert(`Could not delete product: ${err.message}`);
  }
}

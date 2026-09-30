// Transactions Audit History Logic

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  await loadProductsFilter();
  await loadTransactions();

  document.getElementById('filter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    loadTransactions();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('filter-product').value = '';
    document.getElementById('filter-type').value = '';
    loadTransactions();
  });
});

async function loadProductsFilter() {
  try {
    const products = await apiRequest('/products');
    const select = document.getElementById('filter-product');
    if (products) {
      select.innerHTML = '<option value="">All Products</option>' + 
        products.map(p => `<option value="${p.productId}">${p.productName} (${p.sku})</option>`).join('');
    }
  } catch (err) {
    console.error('Error loading products for filter:', err);
  }
}

async function loadTransactions() {
  const tbody = document.getElementById('transactions-tbody');
  tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Loading transactions...</td></tr>`;

  const productId = document.getElementById('filter-product').value;
  const type = document.getElementById('filter-type').value;

  let query = '/transactions?';
  if (productId) query += `productId=${productId}&`;
  if (type) query += `type=${type}&`;

  try {
    const transactions = await apiRequest(query);

    if (!transactions || transactions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No transactions found matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = transactions.map(t => {
      const isStockIn = t.transactionType === 'IN';
      const badgeClass = isStockIn ? 'bg-success' : 'bg-danger';
      const icon = isStockIn ? 'bi-arrow-down-left' : 'bi-arrow-up-right';
      const qtyPrefix = isStockIn ? '+' : '-';

      const formattedDate = new Date(t.transactionDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      return `
        <tr>
          <td><span class="badge bg-light text-dark border">#TX-${t.transactionId}</span></td>
          <td><span class="badge ${badgeClass}"><i class="bi ${icon} me-1"></i>${t.transactionType}</span></td>
          <td class="fw-bold">${t.productName} <code class="small text-muted">(${t.sku})</code></td>
          <td class="fw-bold fs-6 text-${isStockIn ? 'success' : 'danger'}">${qtyPrefix}${t.quantity}</td>
          <td><i class="bi bi-person text-secondary me-1"></i>${t.userName || 'System'}</td>
          <td class="small text-muted">${formattedDate}</td>
          <td class="small text-secondary">${t.remarks || '-'}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Error loading transactions: ${err.message}</td></tr>`;
  }
}

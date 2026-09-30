// Dashboard Logic and Metrics Loader

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth(); // Ensure user is logged in

  const loadingSpinner = document.getElementById('dashboard-loading');
  const dashboardContent = document.getElementById('dashboard-content');

  try {
    const summary = await apiRequest('/dashboard/summary', 'GET', null, true);
    if (!summary) return;

    // Populate metric cards
    document.getElementById('card-products').innerText = summary.totalProducts;
    document.getElementById('card-categories').innerText = summary.totalCategories;
    document.getElementById('card-suppliers').innerText = summary.totalSuppliers;
    document.getElementById('card-stock').innerText = summary.totalStockUnits;
    document.getElementById('card-low-stock').innerText = summary.lowStockCount;
    document.getElementById('card-out-of-stock').innerText = summary.outOfStockCount;
    document.getElementById('card-valuation').innerText = '₹' + Number(summary.totalInventoryValue).toLocaleString('en-IN');
    document.getElementById('card-in-count').innerText = summary.totalStockInTransactions;
    document.getElementById('card-out-count').innerText = summary.totalStockOutTransactions;

    // Render Recent Transactions
    const txTbody = document.getElementById('recent-transactions-tbody');
    if (summary.recentTransactions && summary.recentTransactions.length > 0) {
      txTbody.innerHTML = summary.recentTransactions.map(t => {
        const badgeClass = t.transactionType === 'IN' ? 'bg-success' : 'bg-danger';
        const icon = t.transactionType === 'IN' ? 'bi-arrow-down-left' : 'bi-arrow-up-right';
        const formattedDate = new Date(t.transactionDate).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });

        return `
          <tr>
            <td><span class="badge ${badgeClass}"><i class="bi ${icon} me-1"></i>${t.transactionType}</span></td>
            <td class="fw-semibold">${t.productName} <small class="text-muted">(${t.sku})</small></td>
            <td class="fw-bold">${t.quantity}</td>
            <td class="small text-muted">${formattedDate}</td>
            <td><small class="text-secondary">${t.remarks || '-'}</small></td>
          </tr>
        `;
      }).join('');
    } else {
      txTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No transactions recorded yet.</td></tr>`;
    }

    // Render Low Stock Alerts Panel
    const alertsContainer = document.getElementById('low-stock-alerts-list');
    if (summary.lowStockAlerts && summary.lowStockAlerts.length > 0) {
      alertsContainer.innerHTML = summary.lowStockAlerts.map(p => {
        const isOutOfStock = p.quantity === 0;
        const alertClass = isOutOfStock ? 'alert-danger' : 'alert-warning';
        const badgeText = isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK';
        const badgeClass = isOutOfStock ? 'bg-danger' : 'bg-warning text-dark';

        return `
          <div class="alert ${alertClass} d-flex justify-content-between align-items-center py-2 px-3 mb-2 rounded-3">
            <div>
              <strong>${p.productName}</strong> <small class="text-muted">(${p.sku})</small>
              <div class="small">Available: <span class="fw-bold">${p.quantity}</span> | Min Level: ${p.minimumStockLevel}</div>
            </div>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
        `;
      }).join('');
    } else {
      alertsContainer.innerHTML = `
        <div class="p-3 text-center text-success">
          <i class="bi bi-check-circle-fill fs-2 mb-2 d-block"></i>
          <p class="mb-0 fw-semibold">Healthy Inventory</p>
          <small class="text-muted">All products have sufficient stock levels.</small>
        </div>
      `;
    }

    // Show content, hide spinner
    loadingSpinner.classList.add('d-none');
    dashboardContent.classList.remove('d-none');

  } catch (err) {
    console.error('Error loading dashboard:', err);
    loadingSpinner.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i> Failed to load dashboard data: ${err.message}
      </div>
    `;
  }
});

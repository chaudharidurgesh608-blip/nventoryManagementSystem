// Stock In & Stock Out Management Logic

let productsList = [];

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  await loadProductsForStock();

  // Check URL query parameters (e.g. stock.html?action=out)
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  if (action === 'out') {
    const outTabTrigger = document.querySelector('#stock-out-tab');
    if (outTabTrigger) {
      const tab = new bootstrap.Tab(outTabTrigger);
      tab.show();
    }
  }

  // Stock In product dropdown change
  document.getElementById('inProductSelect').addEventListener('change', (e) => {
    updateProductStockBadge(e.target.value, 'inCurrentStockBadge');
  });

  // Stock Out product dropdown change
  document.getElementById('outProductSelect').addEventListener('change', (e) => {
    updateProductStockBadge(e.target.value, 'outCurrentStockBadge');
  });

  // Form listeners
  document.getElementById('stockInForm').addEventListener('submit', handleStockInSubmit);
  document.getElementById('stockOutForm').addEventListener('submit', handleStockOutSubmit);
});

async function loadProductsForStock() {
  try {
    productsList = await apiRequest('/products');
    if (!productsList) productsList = [];

    const inSelect = document.getElementById('inProductSelect');
    const outSelect = document.getElementById('outProductSelect');

    const optionsHtml = '<option value="">-- Choose Product --</option>' + 
      productsList.map(p => `<option value="${p.productId}">${p.productName} (${p.sku}) — Available: ${p.quantity}</option>`).join('');

    inSelect.innerHTML = optionsHtml;
    outSelect.innerHTML = optionsHtml;

    if (productsList.length > 0) {
      inSelect.value = productsList[0].productId;
      updateProductStockBadge(productsList[0].productId, 'inCurrentStockBadge');

      outSelect.value = productsList[0].productId;
      updateProductStockBadge(productsList[0].productId, 'outCurrentStockBadge');
    }

  } catch (err) {
    console.error('Error loading products for stock:', err);
  }
}

function updateProductStockBadge(productId, badgeId) {
  const badge = document.getElementById(badgeId);
  const product = productsList.find(p => p.productId == productId);
  if (product) {
    badge.innerText = `Currently in Warehouse: ${product.quantity} units`;
  } else {
    badge.innerText = '';
  }
}

async function handleStockInSubmit(e) {
  e.preventDefault();
  const alertBox = document.getElementById('stockInAlert');
  alertBox.className = 'alert d-none';

  const productId = parseInt(document.getElementById('inProductSelect').value, 10);
  const quantity = parseInt(document.getElementById('inQuantity').value, 10);
  const remarks = document.getElementById('inRemarks').value.trim();

  if (!productId || quantity <= 0) {
    alertBox.className = 'alert alert-danger';
    alertBox.innerText = 'Please select a valid product and positive quantity.';
    return;
  }

  try {
    const response = await apiRequest('/stock/in', 'POST', { productId, quantity, remarks }, true);
    if (response && response.isSuccess) {
      alertBox.className = 'alert alert-success';
      alertBox.innerHTML = `
        <i class="bi bi-check-circle-fill me-2"></i> <strong>Stock Received!</strong> 
        Added <strong>+${quantity}</strong> units to ${response.productName}. 
        New Quantity: <strong>${response.newQuantity}</strong>.
      `;
      document.getElementById('inQuantity').value = '';
      document.getElementById('inRemarks').value = '';
      await loadProductsForStock();
    }
  } catch (err) {
    alertBox.className = 'alert alert-danger';
    alertBox.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i> ${err.message}`;
  }
}

async function handleStockOutSubmit(e) {
  e.preventDefault();
  const alertBox = document.getElementById('stockOutAlert');
  alertBox.className = 'alert d-none';

  const productId = parseInt(document.getElementById('outProductSelect').value, 10);
  const quantity = parseInt(document.getElementById('outQuantity').value, 10);
  const remarks = document.getElementById('outRemarks').value.trim();

  const product = productsList.find(p => p.productId == productId);
  if (product && quantity > product.quantity) {
    alertBox.className = 'alert alert-danger';
    alertBox.innerHTML = `<i class="bi bi-x-octagon-fill me-2"></i> <strong>Validation Rejected:</strong> Cannot remove ${quantity} units because only ${product.quantity} units are available in stock!`;
    return;
  }

  try {
    const response = await apiRequest('/stock/out', 'POST', { productId, quantity, remarks }, true);
    if (response && response.isSuccess) {
      alertBox.className = 'alert alert-success';
      alertBox.innerHTML = `
        <i class="bi bi-check-circle-fill me-2"></i> <strong>Stock Issued!</strong> 
        Removed <strong>-${quantity}</strong> units from ${response.productName}. 
        Remaining Quantity: <strong>${response.newQuantity}</strong>.
      `;
      document.getElementById('outQuantity').value = '';
      document.getElementById('outRemarks').value = '';
      await loadProductsForStock();
    }
  } catch (err) {
    alertBox.className = 'alert alert-danger';
    alertBox.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i> ${err.message}`;
  }
}

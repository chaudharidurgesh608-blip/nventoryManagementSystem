// ============================================================================
// INVENTORY MANAGEMENT SYSTEM - CENTRAL API & SMART DUAL-MODE ENGINE
// Mode 1: Real ASP.NET Core 8 Web API & SQL Server (when running locally: http://localhost:5177)
// Mode 2: Interactive Cloud Demo / Offline Fallback (when deployed on Vercel or when API is offline)
// ============================================================================

const API_BASE_URL = 'http://localhost:5177/api';

// Detect environment: Vercel, GitHub Pages, or any HTTPS cloud deployment cannot reach local HTTP
const isCloudHosted = window.location.protocol === 'https:' || 
                      (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && window.location.protocol !== 'file:');

// ============================================================================
// MOCK STORAGE SEED DATA (For Vercel Live Demo & Offline Testing)
// ============================================================================
function initMockStorage() {
  if (!localStorage.getItem('ims_mock_categories')) {
    const defaultCategories = [
      { categoryId: 1, categoryName: 'Electronics', description: 'Computer hardware, peripherals, and devices', createdAt: '2026-09-20T10:00:00Z' },
      { categoryId: 2, categoryName: 'Furniture', description: 'Office ergonomic chairs, desks, and storage', createdAt: '2026-09-20T10:00:00Z' },
      { categoryId: 3, categoryName: 'Office Supplies', description: 'A4 printing paper, printer ink, and stationery', createdAt: '2026-09-20T10:00:00Z' }
    ];
    localStorage.setItem('ims_mock_categories', JSON.stringify(defaultCategories));
  }

  if (!localStorage.getItem('ims_mock_suppliers')) {
    const defaultSuppliers = [
      { supplierId: 1, supplierName: 'Tech Distributors Ltd', phone: '+91 9876543210', email: 'tech@distributors.com', address: 'Plot 45, MIDC Industrial Area, Andheri East, Mumbai', createdAt: '2026-09-20T10:00:00Z' },
      { supplierId: 2, supplierName: 'Modern Furnishings Inc', phone: '+91 9811223344', email: 'contact@modernfurnish.com', address: 'Sector 18, Electronic City, Noida, Delhi NCR', createdAt: '2026-09-20T10:00:00Z' },
      { supplierId: 3, supplierName: 'Prime Stationery Hub', phone: '+91 9822334455', email: 'sales@primestationery.in', address: 'Brigade Road, Shivaji Nagar, Bengaluru, Karnataka', createdAt: '2026-09-20T10:00:00Z' }
    ];
    localStorage.setItem('ims_mock_suppliers', JSON.stringify(defaultSuppliers));
  }

  if (!localStorage.getItem('ims_mock_products')) {
    const defaultProducts = [
      { productId: 1, productName: 'Dell Latitude 5420 Laptop', description: 'Intel Core i5 11th Gen, 16GB RAM, 512GB SSD', sku: 'LAP-DELL-01', categoryId: 1, supplierId: 1, price: 65000, quantity: 25, minimumStockLevel: 5, createdAt: '2026-09-25T10:00:00Z' },
      { productId: 2, productName: 'Logitech MX Master 3S Mouse', description: 'Wireless ergonomic productivity mouse', sku: 'MOU-LOGI-02', categoryId: 1, supplierId: 1, price: 8999, quantity: 4, minimumStockLevel: 5, createdAt: '2026-09-26T10:00:00Z' },
      { productId: 3, productName: 'Ergonomic High-Back Mesh Chair', description: 'Adjustable lumbar support and 3D armrests', sku: 'CHR-ERGO-03', categoryId: 2, supplierId: 2, price: 12500, quantity: 15, minimumStockLevel: 3, createdAt: '2026-09-27T10:00:00Z' },
      { productId: 4, productName: 'Century Star A4 Copier Paper (75 GSM)', description: 'Multipurpose copy paper ream of 500 sheets', sku: 'PAP-A4-04', categoryId: 3, supplierId: 3, price: 350, quantity: 0, minimumStockLevel: 10, createdAt: '2026-09-28T10:00:00Z' },
      { productId: 5, productName: 'Redragon K552 Mechanical Keyboard', description: 'RGB backlit mechanical typing keyboard', sku: 'KBD-MECH-05', categoryId: 1, supplierId: 1, price: 4500, quantity: 18, minimumStockLevel: 4, createdAt: '2026-09-29T10:00:00Z' }
    ];
    localStorage.setItem('ims_mock_products', JSON.stringify(defaultProducts));
  }

  if (!localStorage.getItem('ims_mock_transactions')) {
    const defaultTransactions = [
      { transactionId: 1, productId: 1, productName: 'Dell Latitude 5420 Laptop', sku: 'LAP-DELL-01', transactionType: 'IN', quantity: 25, remarks: 'Initial purchase order stock received', transactionDate: new Date(Date.now() - 5 * 86400000).toISOString(), userName: 'System Admin' },
      { transactionId: 2, productId: 2, productName: 'Logitech MX Master 3S Mouse', sku: 'MOU-LOGI-02', transactionType: 'IN', quantity: 10, remarks: 'Initial procurement batch', transactionDate: new Date(Date.now() - 4 * 86400000).toISOString(), userName: 'System Admin' },
      { transactionId: 3, productId: 2, productName: 'Logitech MX Master 3S Mouse', sku: 'MOU-LOGI-02', transactionType: 'OUT', quantity: 6, remarks: 'Dispatched to Engineering Team', transactionDate: new Date(Date.now() - 2 * 86400000).toISOString(), userName: 'System Admin' },
      { transactionId: 4, productId: 3, productName: 'Ergonomic High-Back Mesh Chair', sku: 'CHR-ERGO-03', transactionType: 'IN', quantity: 15, remarks: 'Office renovation delivery', transactionDate: new Date(Date.now() - 1 * 86400000).toISOString(), userName: 'System Admin' }
    ];
    localStorage.setItem('ims_mock_transactions', JSON.stringify(defaultTransactions));
  }

  if (!localStorage.getItem('ims_mock_users')) {
    const defaultUsers = [
      { id: 'usr-admin-01', fullName: 'System Administrator', email: 'admin@ims.com', role: 'Admin', createdAt: '2026-09-01T10:00:00Z' },
      { id: 'usr-staff-02', fullName: 'Rahul Sharma', email: 'rahul.sharma@ims.com', role: 'User', createdAt: '2026-09-15T11:00:00Z' }
    ];
    localStorage.setItem('ims_mock_users', JSON.stringify(defaultUsers));
  }
}

// Call seed initialization
initMockStorage();

// Helper to calculate product status
function calculateStockStatus(quantity, minimumStockLevel) {
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= minimumStockLevel) return 'Low Stock';
  return 'In Stock';
}

// ============================================================================
// MOCK API HANDLER (Simulates ASP.NET Core API Endpoints in the Browser)
// ============================================================================
async function handleMockRequest(endpoint, method, body) {
  // Artificial small delay for realistic UX feel
  await new Promise(r => setTimeout(r, 60));

  const urlObj = new URL('http://dummy' + endpoint);
  const path = urlObj.pathname;
  const params = urlObj.searchParams;

  let categories = JSON.parse(localStorage.getItem('ims_mock_categories') || '[]');
  let suppliers = JSON.parse(localStorage.getItem('ims_mock_suppliers') || '[]');
  let products = JSON.parse(localStorage.getItem('ims_mock_products') || '[]');
  let transactions = JSON.parse(localStorage.getItem('ims_mock_transactions') || '[]');
  let users = JSON.parse(localStorage.getItem('ims_mock_users') || '[]');

  // 1. Auth: Login
  if (path === '/auth/login' && method === 'POST') {
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    // Default admin or any matching mock user
    let user = users.find(u => u.email.toLowerCase() === email);
    if (!user && (email === 'admin@ims.com' || email.includes('admin'))) {
      user = { id: 'usr-admin-01', fullName: 'System Administrator', email: 'admin@ims.com', role: 'Admin' };
    } else if (!user) {
      // Auto-allow for demo purposes if user types anything valid
      user = { id: 'usr-' + Date.now(), fullName: email.split('@')[0], email: email, role: 'User' };
      users.push(user);
      localStorage.setItem('ims_mock_users', JSON.stringify(users));
    }

    return {
      isSuccess: true,
      message: 'Login successful!',
      token: 'demo-jwt-token-' + Date.now(),
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };
  }

  // 2. Auth: Register
  if (path === '/auth/register' && method === 'POST') {
    const newUser = {
      id: 'usr-' + Date.now(),
      fullName: body.fullName || 'New User',
      email: body.email,
      role: body.role || 'User',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('ims_mock_users', JSON.stringify(users));
    return { isSuccess: true, message: 'User registered successfully!' };
  }

  // 3. Dashboard Summary
  if (path === '/dashboard/summary' && method === 'GET') {
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const totalSuppliers = suppliers.length;
    const totalStockUnits = products.reduce((acc, p) => acc + Number(p.quantity || 0), 0);
    const lowStockCount = products.filter(p => Number(p.quantity) <= Number(p.minimumStockLevel) && Number(p.quantity) > 0).length;
    const outOfStockCount = products.filter(p => Number(p.quantity) === 0).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + (Number(p.price || 0) * Number(p.quantity || 0)), 0);
    const inCount = transactions.filter(t => t.transactionType === 'IN').length;
    const outCount = transactions.filter(t => t.transactionType === 'OUT').length;

    const recentTx = [...transactions].reverse().slice(0, 5);
    const lowStockList = products.filter(p => Number(p.quantity) <= Number(p.minimumStockLevel)).map(p => ({
      productId: p.productId,
      productName: p.productName,
      sku: p.sku,
      quantity: p.quantity,
      minimumStockLevel: p.minimumStockLevel
    }));

    return {
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue,
      totalStockInTransactions: inCount,
      totalStockOutTransactions: outCount,
      recentTransactions: recentTx,
      lowStockAlerts: lowStockList
    };
  }

  // 4. Products GET / POST / PUT / DELETE
  if (path === '/products') {
    if (method === 'GET') {
      const search = params.get('search')?.toLowerCase() || '';
      const catId = params.get('categoryId');
      const status = params.get('status');

      let filtered = products.map(p => {
        const cat = categories.find(c => Number(c.categoryId) === Number(p.categoryId));
        const sup = suppliers.find(s => Number(s.supplierId) === Number(p.supplierId));
        return {
          ...p,
          categoryName: cat ? cat.categoryName : 'Uncategorized',
          supplierName: sup ? sup.supplierName : 'Unknown',
          stockStatus: calculateStockStatus(p.quantity, p.minimumStockLevel)
        };
      });

      if (search) {
        filtered = filtered.filter(p => 
          p.productName.toLowerCase().includes(search) || 
          p.sku.toLowerCase().includes(search) ||
          (p.description && p.description.toLowerCase().includes(search))
        );
      }
      if (catId) {
        filtered = filtered.filter(p => Number(p.categoryId) === Number(catId));
      }
      if (status) {
        filtered = filtered.filter(p => p.stockStatus === status);
      }

      return filtered;
    }

    if (method === 'POST') {
      const newId = products.length > 0 ? Math.max(...products.map(p => p.productId)) + 1 : 1;
      const newProduct = {
        productId: newId,
        productName: body.productName,
        description: body.description || '',
        sku: body.sku.toUpperCase(),
        categoryId: Number(body.categoryId),
        supplierId: Number(body.supplierId),
        price: Number(body.price),
        quantity: Number(body.quantity || 0),
        minimumStockLevel: Number(body.minimumStockLevel || 5),
        createdAt: new Date().toISOString()
      };

      products.push(newProduct);
      localStorage.setItem('ims_mock_products', JSON.stringify(products));

      // Record initial stock transaction if quantity > 0
      if (newProduct.quantity > 0) {
        const tx = {
          transactionId: transactions.length + 1,
          productId: newId,
          productName: newProduct.productName,
          sku: newProduct.sku,
          transactionType: 'IN',
          quantity: newProduct.quantity,
          remarks: 'Initial opening stock entry',
          transactionDate: new Date().toISOString(),
          userName: localStorage.getItem('fullName') || 'Admin'
        };
        transactions.push(tx);
        localStorage.setItem('ims_mock_transactions', JSON.stringify(transactions));
      }

      return newProduct;
    }
  }

  // Single Product PUT / DELETE
  const productMatch = path.match(/^\/products\/(\d+)$/);
  if (productMatch) {
    const prodId = Number(productMatch[1]);
    const idx = products.findIndex(p => p.productId === prodId);

    if (method === 'PUT') {
      if (idx === -1) throw new Error('Product not found.');
      products[idx] = {
        ...products[idx],
        productName: body.productName,
        description: body.description,
        sku: body.sku.toUpperCase(),
        categoryId: Number(body.categoryId),
        supplierId: Number(body.supplierId),
        price: Number(body.price),
        minimumStockLevel: Number(body.minimumStockLevel),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('ims_mock_products', JSON.stringify(products));
      return products[idx];
    }

    if (method === 'DELETE') {
      if (idx === -1) throw new Error('Product not found.');
      products.splice(idx, 1);
      localStorage.setItem('ims_mock_products', JSON.stringify(products));
      return { message: 'Product deleted successfully' };
    }
  }

  // 5. Categories GET / POST / PUT / DELETE
  if (path === '/categories') {
    if (method === 'GET') {
      return categories.map(c => ({
        ...c,
        productCount: products.filter(p => Number(p.categoryId) === Number(c.categoryId)).length
      }));
    }

    if (method === 'POST') {
      const newId = categories.length > 0 ? Math.max(...categories.map(c => c.categoryId)) + 1 : 1;
      const newCat = {
        categoryId: newId,
        categoryName: body.categoryName,
        description: body.description || '',
        createdAt: new Date().toISOString()
      };
      categories.push(newCat);
      localStorage.setItem('ims_mock_categories', JSON.stringify(categories));
      return newCat;
    }
  }

  const catMatch = path.match(/^\/categories\/(\d+)$/);
  if (catMatch) {
    const catId = Number(catMatch[1]);
    const idx = categories.findIndex(c => c.categoryId === catId);

    if (method === 'PUT') {
      if (idx === -1) throw new Error('Category not found.');
      categories[idx] = { ...categories[idx], categoryName: body.categoryName, description: body.description };
      localStorage.setItem('ims_mock_categories', JSON.stringify(categories));
      return categories[idx];
    }

    if (method === 'DELETE') {
      const hasProducts = products.some(p => Number(p.categoryId) === catId);
      if (hasProducts) throw new Error('Cannot delete category: Associated products exist.');
      categories.splice(idx, 1);
      localStorage.setItem('ims_mock_categories', JSON.stringify(categories));
      return { message: 'Category deleted successfully' };
    }
  }

  // 6. Suppliers GET / POST / PUT / DELETE
  if (path === '/suppliers') {
    if (method === 'GET') {
      return suppliers.map(s => ({
        ...s,
        productCount: products.filter(p => Number(p.supplierId) === Number(s.supplierId)).length
      }));
    }

    if (method === 'POST') {
      const newId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.supplierId)) + 1 : 1;
      const newSup = {
        supplierId: newId,
        supplierName: body.supplierName,
        phone: body.phone || '',
        email: body.email || '',
        address: body.address || '',
        createdAt: new Date().toISOString()
      };
      suppliers.push(newSup);
      localStorage.setItem('ims_mock_suppliers', JSON.stringify(suppliers));
      return newSup;
    }
  }

  const supMatch = path.match(/^\/suppliers\/(\d+)$/);
  if (supMatch) {
    const supId = Number(supMatch[1]);
    const idx = suppliers.findIndex(s => s.supplierId === supId);

    if (method === 'PUT') {
      if (idx === -1) throw new Error('Supplier not found.');
      suppliers[idx] = { ...suppliers[idx], ...body };
      localStorage.setItem('ims_mock_suppliers', JSON.stringify(suppliers));
      return suppliers[idx];
    }

    if (method === 'DELETE') {
      const hasProducts = products.some(p => Number(p.supplierId) === supId);
      if (hasProducts) throw new Error('Cannot delete supplier: Associated products exist.');
      suppliers.splice(idx, 1);
      localStorage.setItem('ims_mock_suppliers', JSON.stringify(suppliers));
      return { message: 'Supplier deleted successfully' };
    }
  }

  // 7. Stock IN & Stock OUT
  if (path === '/stock/in' && method === 'POST') {
    const prodId = Number(body.productId);
    const qty = Number(body.quantity);
    const prod = products.find(p => p.productId === prodId);
    if (!prod) throw new Error('Product not found.');

    prod.quantity = Number(prod.quantity) + qty;
    localStorage.setItem('ims_mock_products', JSON.stringify(products));

    const tx = {
      transactionId: transactions.length + 1,
      productId: prod.productId,
      productName: prod.productName,
      sku: prod.sku,
      transactionType: 'IN',
      quantity: qty,
      remarks: body.remarks || 'Stock Inward received',
      transactionDate: new Date().toISOString(),
      userName: localStorage.getItem('fullName') || 'Admin'
    };
    transactions.push(tx);
    localStorage.setItem('ims_mock_transactions', JSON.stringify(transactions));
    return tx;
  }

  if (path === '/stock/out' && method === 'POST') {
    const prodId = Number(body.productId);
    const qty = Number(body.quantity);
    const prod = products.find(p => p.productId === prodId);
    if (!prod) throw new Error('Product not found.');

    if (Number(prod.quantity) < qty) {
      throw new Error(`Insufficient stock! Available: ${prod.quantity}, Requested: ${qty}`);
    }

    prod.quantity = Number(prod.quantity) - qty;
    localStorage.setItem('ims_mock_products', JSON.stringify(products));

    const tx = {
      transactionId: transactions.length + 1,
      productId: prod.productId,
      productName: prod.productName,
      sku: prod.sku,
      transactionType: 'OUT',
      quantity: qty,
      remarks: body.remarks || 'Stock Outward dispatched',
      transactionDate: new Date().toISOString(),
      userName: localStorage.getItem('fullName') || 'Admin'
    };
    transactions.push(tx);
    localStorage.setItem('ims_mock_transactions', JSON.stringify(transactions));
    return tx;
  }

  // 8. Transactions Audit Log
  if (path === '/transactions' && method === 'GET') {
    const prodId = params.get('productId');
    const type = params.get('type');

    let filtered = [...transactions];
    if (prodId) filtered = filtered.filter(t => Number(t.productId) === Number(prodId));
    if (type) filtered = filtered.filter(t => t.transactionType === type);

    return filtered.reverse();
  }

  // 9. Users (Admin view)
  if (path === '/users' && method === 'GET') {
    return users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt || '2026-09-01T10:00:00Z'
    }));
  }

  // Default fallback for unhandled route
  console.warn(`[IMS Mock] Route unhandled: ${method} ${path}`);
  return { message: 'Mock response OK' };
}

// ============================================================================
// PRIMARY API REQUEST FUNCTION
// ============================================================================
async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = false) {
  // If hosted on cloud (Vercel, GitHub Pages) -> Always use Mock Engine seamlessly
  if (isCloudHosted) {
    return await handleMockRequest(endpoint, method, body);
  }

  // If local host -> Attempt real ASP.NET Core API first
  const headers = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (response.status === 401 && requiresAuth) {
      localStorage.clear();
      window.location.href = 'login.html';
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.title || 'An unexpected error occurred.';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.warn(`[IMS API] Real API offline or unreachable (${error.message}). Falling back to Interactive Local Mock Mode.`);
    // Seamless fallback to Mock Engine so user UI never breaks
    return await handleMockRequest(endpoint, method, body);
  }
}

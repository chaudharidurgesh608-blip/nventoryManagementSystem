// Central API configuration and request wrapper
const API_BASE_URL = 'http://localhost:5177/api';

async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = false) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = {
    method: method,
    headers: headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Handle unauthorized (session expired)
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
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

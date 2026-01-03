import API_BASE_URL from '../config/api';

// Helper function pentru request-uri de autentificare
const authRequest = async (endpoint, body) => {
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Eroare la autentificare');
    }

    return data;
  } catch (error) {
    console.error('Auth Error:', error);
    throw error;
  }
};

// Helper function pentru request-uri autentificate
const authenticatedRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Nu ești autentificat');
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Eroare la request');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Login
export const login = async (email, password) => {
  const response = await authRequest('/auth/login', { email, password });
  
  // Salvează token-ul
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return {
    success: true,
    user: response.user
  };
};

// Register
export const register = async (userData) => {
  const response = await authRequest('/auth/register', userData);
  
  // Salvează token-ul
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return {
    success: true,
    user: response.user
  };
};

// Get current user
export const getCurrentUser = async () => {
  const response = await authenticatedRequest('/auth/me');
  return response.user;
};

// Update user
export const updateUser = async (userData) => {
  const response = await authenticatedRequest('/auth/me', {
    method: 'PUT',
    body: userData
  });
  return response.user;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await authenticatedRequest('/auth/change-password', {
    method: 'PUT',
    body: passwordData
  });
  return response;
};

// Logout (doar șterge token-ul)
export const logout = () => {
  localStorage.removeItem('token');
};


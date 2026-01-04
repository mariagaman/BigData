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

// Helper function pentru a obține token-ul (din localStorage sau sessionStorage)
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function pentru request-uri autentificate
const authenticatedRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
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
export const login = async (email, password, rememberMe = false) => {
  const response = await authRequest('/auth/login', { email, password });
  
  // Salvează token-ul în localStorage dacă rememberMe este true, altfel în sessionStorage
  if (response.token) {
    if (rememberMe) {
      localStorage.setItem('token', response.token);
      // Șterge din sessionStorage dacă există
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', response.token);
      // Șterge din localStorage dacă există
      localStorage.removeItem('token');
    }
  }
  
  return {
    success: true,
    user: response.user
  };
};

// Register (salvează întotdeauna în localStorage pentru că e o acțiune de înregistrare)
export const register = async (userData) => {
  const response = await authRequest('/auth/register', userData);
  
  // Salvează token-ul în localStorage (la înregistrare, considerăm că utilizatorul vrea să rămână conectat)
  if (response.token) {
    localStorage.setItem('token', response.token);
    sessionStorage.removeItem('token');
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

// Logout (șterge token-ul din ambele locuri)
export const logout = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// Delete account
export const deleteAccount = async () => {
  const response = await authenticatedRequest('/auth/me', {
    method: 'DELETE'
  });
  // Șterge token-ul din ambele locuri după ștergerea contului
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  return response;
};


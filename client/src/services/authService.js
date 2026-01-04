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

// Helper function pentru a obtine token-ul (din localStorage sau sessionStorage)
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
  
  // Salveaza token-ul in localStorage daca rememberMe este true, altfel in sessionStorage
  if (response.token) {
    if (rememberMe) {
      localStorage.setItem('token', response.token);
      // Sterge din sessionStorage daca exista
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', response.token);
      // Sterge din localStorage daca exista
      localStorage.removeItem('token');
    }
  }
  
  return {
    success: true,
    user: response.user
  };
};

// Register (salveaza intotdeauna in localStorage pentru ca e o actiune de inregistrare)
export const register = async (userData) => {
  const response = await authRequest('/auth/register', userData);
  
  // Salveaza token-ul in localStorage (la inregistrare, consideram ca utilizatorul vrea sa ramana conectat)
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

// Logout (sterge token-ul din ambele locuri)
export const logout = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// Delete account
export const deleteAccount = async () => {
  const response = await authenticatedRequest('/auth/me', {
    method: 'DELETE'
  });
  // Sterge token-ul din ambele locuri dupa stergerea contului
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  return response;
};


import API_BASE_URL from '../config/api';

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

const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

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

export const login = async (email, password, rememberMe = false) => {
  const response = await authRequest('/auth/login', { email, password });

  if (response.token) {
    if (rememberMe) {
      localStorage.setItem('token', response.token);

      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', response.token);

      localStorage.removeItem('token');
    }
  }

  return {
    success: true,
    user: response.user
  };
};

export const register = async (userData) => {
  const response = await authRequest('/auth/register', userData);

  if (response.token) {
    localStorage.setItem('token', response.token);
    sessionStorage.removeItem('token');
  }

  return {
    success: true,
    user: response.user
  };
};

export const getCurrentUser = async () => {
  const response = await authenticatedRequest('/auth/me');
  return response.user;
};

export const updateUser = async (userData) => {
  const response = await authenticatedRequest('/auth/me', {
    method: 'PUT',
    body: userData
  });
  return response.user;
};

export const changePassword = async (passwordData) => {
  const response = await authenticatedRequest('/auth/change-password', {
    method: 'PUT',
    body: passwordData
  });
  return response;
};

export const logout = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

export const deleteAccount = async () => {
  const response = await authenticatedRequest('/auth/me', {
    method: 'DELETE'
  });

  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  return response;
};


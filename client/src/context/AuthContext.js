import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifică dacă utilizatorul este autentificat la încărcarea aplicației
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulează autentificare - în realitate, aici ar fi un API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (email && password.length >= 6) {
          const userData = {
            id: Date.now(),
            email: email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
          };
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          resolve({ success: true, user: userData });
        } else {
          reject({ 
            success: false, 
            message: 'Email sau parolă incorectă' 
          });
        }
      }, 1000);
    });
  };

  const register = async (userData) => {
    // Simulează înregistrare - în realitate, aici ar fi un API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { email, password, firstName, lastName } = userData;
        
        if (email && password.length >= 6 && firstName && lastName) {
          const newUser = {
            id: Date.now(),
            email: email,
            name: `${firstName} ${lastName}`,
            firstName,
            lastName,
            createdAt: new Date().toISOString()
          };
          
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          resolve({ success: true, user: newUser });
        } else {
          reject({ 
            success: false, 
            message: 'Te rugăm să completezi toate câmpurile corect' 
          });
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


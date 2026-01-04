import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email-ul este obligatoriu';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Parola este obligatorie';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Parola trebuie să aibă minim 6 caractere';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const response = await login(formData.email, formData.password, rememberMe);
        // Daca utilizatorul este administrator, redirectioneaza la dashboard
        if (response.user?.role === 'administrator') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } catch (error) {
        setErrors({ submit: error.message || 'Autentificare eșuată. Încearcă din nou.' });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🚂</div>
            <h1>Bine ai revenit!</h1>
            <p>Conectează-te pentru a continua</p>
          </div>

          {errors.submit && (
            <div className="alert alert-error">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="exemplu@email.com"
                autoComplete="email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Parolă
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Introdu parola"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ține-mă minte</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Se conectează...</span>
                </>
              ) : (
                'Conectează-te'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Nu ai cont?{' '}
              <Link to="/register" state={{ from: location.state?.from }}>
                Înregistrează-te acum
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-benefits">
          <h2>De ce RailMate?</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <div>
                <h3>Rezervare rapidă</h3>
                <p>Cumpără bilete în mai puțin de 2 minute</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <div>
                <h3>Cele mai bune prețuri</h3>
                <p>Oferim cele mai competitive tarife</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📱</span>
              <div>
                <h3>Bilete digitale</h3>
                <p>Acces instant la bilete pe telefon</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎟️</span>
              <div>
                <h3>Gestionare ușoară</h3>
                <p>Toate rezervările într-un singur loc</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


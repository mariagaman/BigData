import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Prenumele este obligatoriu';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Numele este obligatoriu';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email-ul este obligatoriu';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalid';
    }
    
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Număr de telefon invalid (10 cifre)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Parola este obligatorie';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Parola trebuie să aibă minim 6 caractere';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Parolele nu coincid';
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'Trebuie să accepți termenii și condițiile';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        await register(formData);
        navigate(from, { replace: true });
      } catch (error) {
        setErrors({ submit: error.message || 'Înregistrare eșuată. Încearcă din nou.' });
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
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="auth-logo">🚂</div>
            <h1>Creează cont nou</h1>
            <p>Înregistrează-te pentru a rezerva bilete</p>
          </div>

          {errors.submit && (
            <div className="alert alert-error">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  <span className="label-icon">👤</span>
                  Prenume
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Ion"
                  autoComplete="given-name"
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  <span className="label-icon">👤</span>
                  Nume
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Popescu"
                  autoComplete="family-name"
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

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
              <label htmlFor="phone">
                <span className="label-icon">📱</span>
                Telefon (opțional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="07XXXXXXXX"
                autoComplete="tel"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
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
                  placeholder="Minim 6 caractere"
                  autoComplete="new-password"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <span className="label-icon">🔒</span>
                Confirmă parola
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Rescrie parola"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="terms-group">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.terms) {
                      setErrors({ ...errors, terms: '' });
                    }
                  }}
                />
                <span>
                  Sunt de acord cu{' '}
                  <Link to="/terms">termenii și condițiile</Link>
                  {' '}și{' '}
                  <Link to="/privacy">politica de confidențialitate</Link>
                </span>
              </label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>

            <button 
              type="submit" 
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Se înregistrează...</span>
                </>
              ) : (
                'Creează cont'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Ai deja cont?{' '}
              <Link to="/login" state={{ from: location.state?.from }}>
                Conectează-te aici
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-benefits">
          <h2>Avantajele contului RailMate</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">📋</span>
              <div>
                <h3>Istoric complet</h3>
                <p>Accesează toate rezervările tale oricând</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <div>
                <h3>Checkout rapid</h3>
                <p>Datele tale salvate pentru rezervări rapide</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🔔</span>
              <div>
                <h3>Notificări</h3>
                <p>Primește alerte despre trenuri și oferte</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎁</span>
              <div>
                <h3>Oferte exclusive</h3>
                <p>Reduceri speciale pentru membrii înregistrați</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


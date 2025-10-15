import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🚂</span>
          <span className="logo-text">RailMate</span>
        </Link>

        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <li>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Acasă
            </Link>
          </li>
          <li>
            <Link 
              to="/search" 
              className={`nav-link ${isActive('/search') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Căutare Trenuri
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link 
                to="/my-bookings" 
                className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Rezervările Mele
              </Link>
            </li>
          )}
          
          {!isAuthenticated ? (
            <>
              <li className="auth-links">
                <Link 
                  to="/login" 
                  className="nav-link login-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Conectare
                </Link>
              </li>
              <li className="auth-links">
                <Link 
                  to="/register" 
                  className="nav-link register-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Înregistrare
                </Link>
              </li>
            </>
          ) : (
            <li className="user-menu-container">
              <button 
                className="user-menu-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="user-avatar">👤</span>
                <span className="user-name">{user.name}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar-large">👤</div>
                    <div className="user-details">
                      <div className="user-name-large">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link 
                    to="/my-bookings" 
                    className="dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    <span>📋</span>
                    Rezervările mele
                  </Link>
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    <span>⚙️</span>
                    Setări cont
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <span>🚪</span>
                    Deconectare
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;


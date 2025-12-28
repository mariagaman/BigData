import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || user?.name?.split(' ')[0] || '',
      lastName: user?.lastName || user?.name?.split(' ')[1] || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1>Profilul meu</h1>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>Informații personale</h2>
              {!isEditing && (
                <button className="btn-outline" onClick={() => setIsEditing(true)}>
                  ✏️ Editează
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Prenume</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nume</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                  <small>Email-ul nu poate fi modificat</small>
                </div>
                <div className="form-group">
                  <label>Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                  />
                </div>
                <div className="form-actions">
                  <button className="btn-primary" onClick={handleSave}>
                    💾 Salvează
                  </button>
                  <button className="btn-secondary" onClick={handleCancel}>
                    ❌ Anulează
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Nume complet:</span>
                  <span className="info-value">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.name || 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user?.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Telefon:</span>
                  <span className="info-value">{user?.phone || 'Nu este setat'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Membru din:</span>
                  <span className="info-value">{formatDate(user?.createdAt)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Acțiuni rapide</h2>
            <div className="quick-actions">
              <button className="action-card" onClick={() => navigate('/my-bookings')}>
                <span className="action-icon">🎫</span>
                <span className="action-text">Biletele mele</span>
              </button>
              <button className="action-card" onClick={() => navigate('/')}>
                <span className="action-icon">🔍</span>
                <span className="action-text">Caută trenuri</span>
              </button>
              <button className="action-card" onClick={logout}>
                <span className="action-icon">🚪</span>
                <span className="action-text">Deconectează-te</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


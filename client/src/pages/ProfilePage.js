import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, changePassword, logout, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Te rugăm să completezi toate câmpurile');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Parola nouă trebuie să aibă minim 6 caractere');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Parola nouă și confirmarea parolei nu se potrivesc');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('Parola nouă trebuie să fie diferită de parola curentă');
      return;
    }

    try {
      await changePassword(passwordData);
      setPasswordSuccess('Parola a fost schimbată cu succes!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      setPasswordError(error.message || 'Eroare la schimbarea parolei');
    }
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = 'Ești sigur că vrei să ștergi contul? Această acțiune este permanentă și nu poate fi anulată.';
    const confirmDelete = window.confirm(confirmMessage);
    
    if (!confirmDelete) {
      return;
    }

    // Confirmare suplimentara
    const secondConfirm = window.confirm('Această acțiune va șterge permanent contul tău și toate datele asociate. Ești absolut sigur?');
    
    if (!secondConfirm) {
      return;
    }

    try {
      await deleteAccount();
      alert('Contul tău a fost șters cu succes.');
      navigate('/');
    } catch (error) {
      alert(error.message || 'Eroare la ștergerea contului. Te rugăm să încerci din nou.');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.firstName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1>
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.name || 'Profilul meu'}
          </h1>
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
              </div>
            )}
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2>Schimbare parolă</h2>
              {!isChangingPassword && (
                <button className="btn-outline" onClick={() => setIsChangingPassword(true)}>
                  🔒 Schimbă parola
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <div className="profile-form">
                {passwordError && (
                  <div className="alert alert-error">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="alert alert-success">{passwordSuccess}</div>
                )}
                <div className="form-group">
                  <label>Parola curentă *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Introdu parola curentă"
                  />
                </div>
                <div className="form-group">
                  <label>Parola nouă *</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Minim 6 caractere"
                  />
                </div>
                <div className="form-group">
                  <label>Confirmă parola nouă *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirmă parola nouă"
                  />
                </div>
                <div className="form-actions">
                  <button className="btn-primary" onClick={handlePasswordSubmit}>
                    💾 Salvează parola
                  </button>
                  <button className="btn-secondary" onClick={handlePasswordCancel}>
                    ❌ Anulează
                  </button>
                </div>
              </div>
            ) : (
              <p className="password-info">Pentru securitate, schimbă-ți parola periodic.</p>
            )}
          </div>

          <div className="profile-section">
            <h2>Acțiuni rapide</h2>
            <div className="quick-actions">
              <button className="action-card" onClick={() => navigate('/my-bookings')}>
                <span className="action-icon">🎟️</span>
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

          <div className="profile-section danger-zone">
            <button className="btn-danger-delete" onClick={handleDeleteAccount}>
              🗑️ Șterge contul
            </button>
            <p className="danger-description">
              Ștergerea contului va elimina permanent toate datele tale, inclusiv rezervările și plățile asociate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


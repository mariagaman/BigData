import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchForm from '../components/SearchForm';
import trainIcon from '../pictures/icon.jfif';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Redirecționează administratorii la dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'administrator') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Dacă utilizatorul este administrator, nu afișa conținutul
  if (isAuthenticated && user?.role === 'administrator') {
    return null;
  }
  const features = [
    {
      icon: '🎫',
      title: 'Rezervare rapidă',
      description: 'Rezervă biletele tale în doar câteva minute'
    },
    {
      icon: '💳',
      title: 'Plată securizată',
      description: 'Tranzacții sigure și protejate'
    },
    {
      icon: '📱',
      title: 'Bilete digitale',
      description: 'Primește biletele direct pe telefon'
    },
    {
      icon: '🔔',
      title: 'Notificări în timp real',
      description: 'Fii la curent cu toate schimbările'
    }
  ];

  const popularRoutes = [
    { from: 'București Nord', to: 'Brașov', price: '45 RON' },
    { from: 'Cluj-Napoca', to: 'Timișoara Nord', price: '60 RON' },
    { from: 'București Nord', to: 'Constanța', price: '55 RON' },
    { from: 'Iași', to: 'București Nord', price: '75 RON' }
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Călătorește cu trenul prin toată România</h1>
          <p className="hero-subtitle">
            Rezervă bilete de tren rapid, simplu și la cele mai bune prețuri
          </p>
          
          <div className="search-container">
            <SearchForm />
          </div>
        </div>
        
        <div className="hero-image">
          <img src={trainIcon} alt="Tren RailMate" className="train-illustration" />
        </div>
      </section>

      <section className="features">
        <div className="section-container">
          <h2 className="section-title">De ce să alegi RailMate?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="popular-routes">
        <div className="section-container">
          <h2 className="section-title">Rute Populare</h2>
          <div className="routes-grid">
            {popularRoutes.map((route, index) => (
              <div key={index} className="route-card">
                <div className="route-info">
                  <span className="route-city">{route.from}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-city">{route.to}</span>
                </div>
                <div className="route-price">de la {route.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Începe călătoria ta astăzi!</h2>
          <p>Descoperă România cu RailMate - partenerul tău de încredere pentru călătorii cu trenul</p>
          <a href="/search" className="cta-button">Caută trenuri</a>
        </div>
      </section>
    </div>
  );
};

export default Home;


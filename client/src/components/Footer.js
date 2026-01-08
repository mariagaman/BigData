import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>RailMate</h3>
          <p>Partenerul tău de încredere pentru călătorii cu trenul</p>
        </div>

        <div className="footer-section">
          <h4>Linkuri Rapide</h4>
          <ul>
            <li><a href="/">Acasă</a></li>
            <li><a href="/search">Căutare Trenuri</a></li>
            <li><a href="/my-bookings">Rezervările Mele</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Informații</h4>
          <ul>
            <li><a href="#about">Despre Noi</a></li>
            <li><a href="#terms">Termeni și Condiții</a></li>
            <li><a href="#privacy">Politica de Confidențialitate</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>📧 contact@railmate.ro</li>
            <li>📞 0800 123 456</li>
            <li>📍 București, România</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 RailMate. Toate drepturile rezervate.</p>
      </div>
    </footer>
  );
};

export default Footer;


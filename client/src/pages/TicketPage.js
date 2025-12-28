import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import '../styles/TicketPage.css';

// Component simplu pentru generarea QR code (folosind un serviciu online)
const QRCode = ({ value }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`;
  return (
    <div className="qr-code-container">
      <img src={qrUrl} alt="QR Code" className="qr-code-image" />
    </div>
  );
};

const TicketPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { userBookings } = useBooking();

  const booking = userBookings.find(b => b.id === parseInt(bookingId));

  if (!booking) {
    return (
      <div className="ticket-page">
        <div className="ticket-container">
          <div className="error-message">
            <h2>Biletul nu a fost găsit</h2>
            <p>Biletul căutat nu există sau nu ai acces la el.</p>
            <button className="btn-primary" onClick={() => navigate('/my-bookings')}>
              Înapoi la biletele mele
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ro-RO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Generăm un cod unic pentru bilet
  const ticketCode = `RAILMATE-${booking.id}-${booking.train.trainNumber}-${formatDateShort(booking.train.departureTime).replace(/\//g, '')}`;
  const qrData = JSON.stringify({
    bookingId: booking.id,
    trainNumber: booking.train.trainNumber,
    from: booking.train.from,
    to: booking.train.to,
    date: booking.train.departureTime,
    code: ticketCode
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simulare descărcare PDF
    alert('Funcționalitatea de descărcare PDF va fi implementată în curând!');
  };

  return (
    <div className="ticket-page">
      <div className="ticket-container">
        <div className="ticket-header">
          <button className="back-button" onClick={() => navigate('/my-bookings')}>
            ← Înapoi
          </button>
          <div className="ticket-actions">
            <button className="btn-outline" onClick={handleDownload}>
              📥 Descarcă PDF
            </button>
            <button className="btn-primary" onClick={handlePrint}>
              🖨️ Printează
            </button>
          </div>
        </div>

        <div className="ticket-card">
          <div className="ticket-header-section">
            <div className="ticket-logo">
              <span className="logo-icon">🚂</span>
              <span className="logo-text">RailMate</span>
            </div>
            <div className="ticket-number">
              <span className="number-label">Bilet #</span>
              <span className="number-value">{booking.id}</span>
            </div>
          </div>

          <div className="ticket-body">
            <div className="ticket-main-info">
              <div className="route-section">
                <div className="station-box departure">
                  <div className="station-label">Plecare</div>
                  <div className="station-name">{booking.train.from}</div>
                  <div className="station-time">{formatTime(booking.train.departureTime)}</div>
                  <div className="station-date">{formatDate(booking.train.departureTime)}</div>
                </div>

                <div className="route-arrow-large">→</div>

                <div className="station-box arrival">
                  <div className="station-label">Sosire</div>
                  <div className="station-name">{booking.train.to}</div>
                  <div className="station-time">{formatTime(booking.train.arrivalTime)}</div>
                  <div className="station-date">{formatDate(booking.train.arrivalTime)}</div>
                </div>
              </div>

              <div className="train-details">
                <div className="detail-item">
                  <span className="detail-icon">🚆</span>
                  <div>
                    <div className="detail-label">Tren</div>
                    <div className="detail-value">
                      {booking.train.type} {booking.train.trainNumber}
                    </div>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <div>
                    <div className="detail-label">Pasageri</div>
                    <div className="detail-value">{booking.passengers.length}</div>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <div>
                    <div className="detail-label">Preț</div>
                    <div className="detail-value">{booking.totalPrice} RON</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-qr-section">
              <div className="qr-code-wrapper">
                <QRCode value={qrData} />
                <div className="qr-code-label">Cod bilet: {ticketCode}</div>
              </div>
            </div>
          </div>

          <div className="ticket-passengers">
            <h3>Pasageri</h3>
            <div className="passengers-list">
              {booking.passengers.map((passenger, index) => (
                <div key={index} className="passenger-item">
                  <div className="passenger-number">{index + 1}</div>
                  <div className="passenger-info">
                    <div className="passenger-name">
                      {passenger.firstName} {passenger.lastName}
                    </div>
                    {passenger.idNumber && (
                      <div className="passenger-id">CI: {passenger.idNumber}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ticket-footer">
            <div className="ticket-warning">
              ⚠️ Prezintă acest bilet la control. Biletul este valabil doar pentru data și trenul specificat.
            </div>
            <div className="ticket-info">
              <p>Pentru întrebări, contactează serviciul clienți RailMate.</p>
              <p>Bilet generat: {new Date().toLocaleString('ro-RO')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;


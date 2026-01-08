import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBookingById } from '../services/api';
import SearchForm from '../components/SearchForm';
import '../styles/ConfirmationPage.css';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      navigate('/');
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const booking = await getBookingById(bookingId);
        setBookingData(booking);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Nu s-a putut încărca rezervarea');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container">
          <div className="loading">Se încarcă...</div>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container">
          <div className="error">{error || 'Rezervarea nu a fost găsită'}</div>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Înapoi acasă
          </button>
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadTicket = () => {
    if (bookingData?.id) {
      navigate(`/ticket/${bookingData.id}`);
    }
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="search-form-section">
          <SearchForm inline={true} />
        </div>

        <div className="success-icon">✅</div>

        <h1>Rezervare confirmată!</h1>
        <p className="confirmation-message">
          Biletele tale au fost rezervate cu succes. Vei primi un email de confirmare la adresa specificată.
        </p>

        <div className="booking-details">
          <div className="booking-number">
            <span className="label">Număr rezervare:</span>
            <span className="value">#{bookingData.bookingNumber || bookingData.id}</span>
          </div>

          <div className="journey-details">
            <h2>Detalii călătorie</h2>

            <div className="detail-row">
              <span className="detail-label">Tren:</span>
              <span className="detail-value">
                {bookingData.train?.type || 'N/A'} {bookingData.train?.trainNumber || 'N/A'}
              </span>
            </div>

            <div className="route-display">
              <div className="route-station">
                <div className="station-name">{bookingData.train?.from || 'N/A'}</div>
                <div className="station-time">{bookingData.train?.departureTime ? formatTime(bookingData.train.departureTime) : 'N/A'}</div>
              </div>
              <div className="route-arrow">→</div>
              <div className="route-station">
                <div className="station-name">{bookingData.train?.to || 'N/A'}</div>
                <div className="station-time">{bookingData.train?.arrivalTime ? formatTime(bookingData.train.arrivalTime) : 'N/A'}</div>
              </div>
            </div>

            <div className="detail-row">
              <span className="detail-label">Data:</span>
              <span className="detail-value">{bookingData.train?.departureTime ? formatDate(bookingData.train.departureTime) : 'N/A'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Pasageri:</span>
              <span className="detail-value">{bookingData.passengers.length}</span>
            </div>

            <div className="passengers-list">
              <h3>Lista pasageri:</h3>
              {bookingData.passengers.map((passenger, index) => (
                <div key={index} className="passenger-item">
                  {index + 1}. {passenger.firstName} {passenger.lastName}
                </div>
              ))}
            </div>
          </div>

          <div className="payment-details">
            <h2>Detalii plată</h2>

            <div className="detail-row">
              <span className="detail-label">Metodă plată:</span>
              <span className="detail-value">
                {bookingData.paymentMethod === 'card' && '💳 Card bancar'}
                {bookingData.paymentMethod === 'paypal' && '🅿️ PayPal'}
                {bookingData.paymentMethod === 'transfer' && '🏦 Transfer bancar'}
              </span>
            </div>

            <div className="detail-row total">
              <span className="detail-label">Total plătit:</span>
              <span className="detail-value">{bookingData.totalPrice} RON</span>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="btn-primary" onClick={handleDownloadTicket}>
            📥 Descarcă biletele
          </button>
          <button className="btn-secondary" onClick={() => navigate('/my-bookings')}>
            📋 Vezi toate rezervările
          </button>
          <button className="btn-outline" onClick={() => navigate('/')}>
            🏠 Înapoi acasă
          </button>
        </div>

        <div className="next-steps">
          <h3>Ce urmează?</h3>
          <ul>
            <li>✉️ Vei primi un email de confirmare cu biletele atașate</li>
            <li>📱 Poți accesa biletele oricând din secțiunea "Rezervările mele"</li>
            <li>🎟️ Prezintă biletul electronic sau versiunea printată la control</li>
            <li>⏰ Te recomandăm să ajungi cu 15 minute înainte de plecare</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;


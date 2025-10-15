import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import '../styles/MyBookings.css';

const MyBookings = () => {
  const navigate = useNavigate();
  const { userBookings, cancelBooking } = useBooking();
  const [filter, setFilter] = useState('all');

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isUpcoming = (booking) => {
    return new Date(booking.train.departureTime) > new Date();
  };

  const isPast = (booking) => {
    return new Date(booking.train.departureTime) < new Date();
  };

  const filteredBookings = userBookings.filter(booking => {
    if (filter === 'upcoming') return isUpcoming(booking);
    if (filter === 'past') return isPast(booking);
    return true;
  });

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Ești sigur că vrei să anulezi această rezervare?')) {
      cancelBooking(bookingId);
    }
  };

  if (userBookings.length === 0) {
    return (
      <div className="my-bookings">
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <h2>Nu ai încă rezervări</h2>
          <p>Când vei rezerva bilete, acestea vor apărea aici.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Caută trenuri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <div className="bookings-container">
        <h1>Rezervările mele</h1>

        <div className="bookings-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Toate ({userBookings.length})
          </button>
          <button
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Viitoare ({userBookings.filter(isUpcoming).length})
          </button>
          <button
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Trecute ({userBookings.filter(isPast).length})
          </button>
        </div>

        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <p>Nu există rezervări în această categorie.</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className={`booking-card ${isPast(booking) ? 'past' : ''}`}>
                <div className="booking-header">
                  <div className="booking-number">
                    Rezervare #{booking.id}
                  </div>
                  <div className={`booking-status ${isUpcoming(booking) ? 'upcoming' : 'past'}`}>
                    {isUpcoming(booking) ? '✓ Activă' : '✓ Finalizată'}
                  </div>
                </div>

                <div className="booking-body">
                  <div className="train-info">
                    <span className="train-type">{booking.train.type}</span>
                    <span className="train-number">{booking.train.trainNumber}</span>
                  </div>

                  <div className="journey-info">
                    <div className="journey-station">
                      <div className="station-name">{booking.train.from}</div>
                      <div className="station-time">{formatTime(booking.train.departureTime)}</div>
                    </div>
                    <div className="journey-arrow">→</div>
                    <div className="journey-station">
                      <div className="station-name">{booking.train.to}</div>
                      <div className="station-time">{formatTime(booking.train.arrivalTime)}</div>
                    </div>
                  </div>

                  <div className="booking-info">
                    <div className="info-item">
                      <span className="info-label">Data:</span>
                      <span className="info-value">{formatDate(booking.train.departureTime)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Pasageri:</span>
                      <span className="info-value">{booking.passengers.length}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Total:</span>
                      <span className="info-value">{booking.totalPrice} RON</span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  <button className="btn-outline">
                    📥 Descarcă bilet
                  </button>
                  {isUpcoming(booking) && (
                    <button 
                      className="btn-danger"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      ❌ Anulează
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;


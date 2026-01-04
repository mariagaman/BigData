import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, cancelBooking as cancelBookingAPI } from '../services/api';
import '../styles/MyBookings.css';

const MyBookings = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const bookings = await getUserBookings();
        setUserBookings(bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated]);

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

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Ești sigur că vrei să anulezi această rezervare? Suma va fi rambursată.')) {
      try {
        await cancelBookingAPI(bookingId);
        // Reincarca lista de rezervari pentru a obtine datele actualizate
        const updatedBookings = await getUserBookings();
        setUserBookings(updatedBookings);
        alert('Rezervarea a fost anulată cu succes. Suma va fi rambursată.');
      } catch (error) {
        console.error('Error canceling booking:', error);
        alert(error.message || 'Eroare la anularea rezervării. Te rugăm să încerci din nou.');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="my-bookings">
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h2>Trebuie să te conectezi</h2>
          <p>Pentru a vedea rezervările tale, te rugăm să te conectezi.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Conectează-te
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-bookings">
        <div className="loading">
          <div className="spinner"></div>
          <p>Încărcăm rezervările...</p>
        </div>
      </div>
    );
  }

  if (userBookings.length === 0) {
    return (
      <div className="my-bookings">
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
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
                    Rezervare #{booking.bookingNumber || booking.id}
                  </div>
                  <div className={`booking-status ${
                    booking.status === 'anulata' ? 'cancelled' : 
                    isUpcoming(booking) ? 'upcoming' : 'past'
                  }`}>
                    {booking.status === 'anulata' ? '✗ Anulată' : 
                     isUpcoming(booking) ? '✓ Activă' : '✓ Finalizată'}
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
                  <Link to={`/ticket/${booking.id}`} className="btn-primary">
                    🎟️ Vezi bilet
                  </Link>
                  {isUpcoming(booking) && booking.status !== 'anulata' && (
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

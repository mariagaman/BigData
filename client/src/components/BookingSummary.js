import React from 'react';
import '../styles/BookingSummary.css';

const BookingSummary = ({ train, passengers, totalPrice }) => {
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

  return (
    <div className="booking-summary">
      <h3 className="summary-title">Rezumatul Călătoriei</h3>
      
      <div className="summary-section">
        <div className="summary-row">
          <span className="summary-label">Tren:</span>
          <span className="summary-value">{train.type} {train.trainNumber}</span>
        </div>
        
        <div className="summary-route">
          <div className="summary-station">
            <div className="station-name">{train.from}</div>
            <div className="station-time">{formatTime(train.departureTime)}</div>
          </div>
          <div className="route-arrow">→</div>
          <div className="summary-station">
            <div className="station-name">{train.to}</div>
            <div className="station-time">{formatTime(train.arrivalTime)}</div>
          </div>
        </div>
        
        <div className="summary-row">
          <span className="summary-label">Data:</span>
          <span className="summary-value">{formatDate(train.departureTime)}</span>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-row">
          <span className="summary-label">Pasageri:</span>
          <span className="summary-value">{passengers}</span>
        </div>
        
        <div className="summary-row">
          <span className="summary-label">Preț pe bilet:</span>
          <span className="summary-value">{train.price} RON</span>
        </div>
      </div>

      <div className="summary-total">
        <span className="total-label">Total de plată:</span>
        <span className="total-amount">{totalPrice} RON</span>
      </div>
    </div>
  );
};

export default BookingSummary;


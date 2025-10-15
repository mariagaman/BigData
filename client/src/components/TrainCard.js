import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TrainCard.css';

const TrainCard = ({ train }) => {
  const navigate = useNavigate();

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateDuration = (departure, arrival) => {
    const diff = new Date(arrival) - new Date(departure);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTrainTypeClass = (type) => {
    const typeMap = {
      'InterCity': 'intercity',
      'Regio': 'regio',
      'Personal': 'personal',
      'InterRegio': 'interregio'
    };
    return typeMap[type] || 'default';
  };

  const handleBooking = () => {
    navigate(`/booking/${train.id}`);
  };

  return (
    <div className="train-card">
      <div className="train-header">
        <div className="train-type">
          <span className={`train-badge ${getTrainTypeClass(train.type)}`}>
            {train.type}
          </span>
          <span className="train-number">{train.trainNumber}</span>
        </div>
        <div className="train-price">
          <span className="price-amount">{train.price} RON</span>
          <span className="price-label">/ persoană</span>
        </div>
      </div>

      <div className="train-route">
        <div className="route-point">
          <div className="route-time">{formatTime(train.departureTime)}</div>
          <div className="route-station">{train.from}</div>
        </div>

        <div className="route-line">
          <div className="route-duration">{calculateDuration(train.departureTime, train.arrivalTime)}</div>
          <div className="route-visual">
            <div className="route-dot"></div>
            <div className="route-connector"></div>
            <div className="route-dot"></div>
          </div>
          {train.stops && (
            <div className="route-stops">
              {train.stops} {train.stops === 1 ? 'oprire' : 'opriri'}
            </div>
          )}
        </div>

        <div className="route-point">
          <div className="route-time">{formatTime(train.arrivalTime)}</div>
          <div className="route-station">{train.to}</div>
        </div>
      </div>

      <div className="train-details">
        <div className="detail-item">
          <span className="detail-icon">💺</span>
          <span className="detail-text">{train.availableSeats} locuri disponibile</span>
        </div>
        {train.amenities && (
          <div className="amenities">
            {train.amenities.includes('wifi') && <span title="WiFi gratuit">📶</span>}
            {train.amenities.includes('ac') && <span title="Aer condiționat">❄️</span>}
            {train.amenities.includes('food') && <span title="Vagon restaurant">🍽️</span>}
            {train.amenities.includes('power') && <span title="Prize electrice">🔌</span>}
          </div>
        )}
      </div>

      <div className="train-footer">
        <button 
          className="book-button"
          onClick={handleBooking}
          disabled={train.availableSeats === 0}
        >
          {train.availableSeats === 0 ? 'Complet rezervat' : 'Rezervă acum'}
        </button>
      </div>
    </div>
  );
};

export default TrainCard;


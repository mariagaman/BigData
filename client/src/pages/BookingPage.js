import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { getTrainById } from '../services/api';
import BookingSummary from '../components/BookingSummary';
import PassengerForm from '../components/PassengerForm';
import '../styles/BookingPage.css';

const BookingPage = () => {
  const { trainId } = useParams();
  const navigate = useNavigate();
  const { searchParams, createBooking } = useBooking();
  
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passengers, setPassengers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        const trainData = await getTrainById(trainId);
        setTrain(trainData);
        setPassengers(new Array(searchParams.passengers).fill(null));
      } catch (error) {
        console.error('Error fetching train:', error);
        setError('Nu am putut încărca detaliile trenului');
      } finally {
        setLoading(false);
      }
    };

    fetchTrain();
  }, [trainId, searchParams.passengers]);

  const handlePassengerUpdate = (index, passengerData) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = passengerData;
    setPassengers(updatedPassengers);
  };

  const validateBooking = () => {
    if (!termsAccepted) {
      setError('Trebuie să accepți termenii și condițiile');
      return false;
    }

    const allPassengersValid = passengers.every(p => 
      p && p.firstName && p.lastName && p.email && p.phone && p.idNumber
    );

    if (!allPassengersValid) {
      setError('Te rugăm să completezi toate datele pasagerilor');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateBooking()) {
      return;
    }

    const booking = {
      train,
      passengers,
      paymentMethod,
      totalPrice: train.price * searchParams.passengers,
      searchParams
    };

    const confirmedBooking = createBooking(booking);
    navigate('/confirmation');
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Încărcăm detaliile rezervării...</p>
        </div>
      </div>
    );
  }

  if (!train) {
    return (
      <div className="booking-page">
        <div className="error-message">
          <h2>Trenul nu a fost găsit</h2>
          <button onClick={() => navigate('/search')}>Înapoi la căutare</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-main">
          <h1>Finalizează rezervarea</h1>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <section className="booking-section">
              <h2>Detalii pasageri</h2>
              {passengers.map((_, index) => (
                <PassengerForm
                  key={index}
                  passengerIndex={index}
                  onUpdate={handlePassengerUpdate}
                />
              ))}
            </section>

            <section className="booking-section">
              <h2>Metodă de plată</h2>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-details">
                    <span className="payment-icon">💳</span>
                    <span className="payment-label">Card bancar</span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-details">
                    <span className="payment-icon">🅿️</span>
                    <span className="payment-label">PayPal</span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-details">
                    <span className="payment-icon">🏦</span>
                    <span className="payment-label">Transfer bancar</span>
                  </div>
                </label>
              </div>
            </section>

            <section className="booking-section">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span>
                  Sunt de acord cu{' '}
                  <a href="#terms" target="_blank">termenii și condițiile</a>
                  {' '}și{' '}
                  <a href="#privacy" target="_blank">politica de confidențialitate</a>
                </span>
              </label>
            </section>

            <div className="booking-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/search')}
              >
                Înapoi
              </button>
              <button type="submit" className="btn-primary">
                Confirmă și plătește
              </button>
            </div>
          </form>
        </div>

        <aside className="booking-sidebar">
          <BookingSummary
            train={train}
            passengers={searchParams.passengers}
            totalPrice={train.price * searchParams.passengers}
          />
        </aside>
      </div>
    </div>
  );
};

export default BookingPage;


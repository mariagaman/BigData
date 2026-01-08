import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const [passengers, setPassengers] = useState([{ firstName: '', lastName: '', email: '', phone: '', idNumber: '' }]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrain = async () => {
      try {

        const savedTrain = sessionStorage.getItem('selectedTrain');
        if (savedTrain) {
          try {
            const trainData = JSON.parse(savedTrain);

            if (trainData.id === trainId) {
              setTrain(trainData);
              sessionStorage.removeItem('selectedTrain');
            } else {

              const trainData = await getTrainById(trainId, searchParams?.from, searchParams?.to);
              setTrain(trainData);
            }
          } catch (e) {

            const trainData = await getTrainById(trainId, searchParams?.from, searchParams?.to);
            setTrain(trainData);
          }
        } else {

          const trainData = await getTrainById(trainId, searchParams?.from, searchParams?.to);
          setTrain(trainData);
        }

        const initialPassengerCount = searchParams.passengers || 1;
        setPassengers(new Array(initialPassengerCount).fill(null).map(() => ({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          idNumber: ''
        })));
      } catch (error) {
        console.error('Error fetching train:', error);
        setError('Nu am putut încărca detaliile trenului');
      } finally {
        setLoading(false);
      }
    };

    fetchTrain();
  }, [trainId]);

  const handlePassengerUpdate = (index, passengerData) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = passengerData;
    setPassengers(updatedPassengers);
  };

  const handleAddPassenger = () => {

    if (train && passengers.length >= train.availableSeats) {
      setError(`Nu mai sunt locuri disponibile. Maxim ${train.availableSeats} pasageri.`);
      return;
    }
    setPassengers([...passengers, { firstName: '', lastName: '', email: '', phone: '', idNumber: '' }]);
    setError('');
  };

  const handleRemovePassenger = (index) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((_, i) => i !== index);
      setPassengers(updatedPassengers);
      setError('');
    } else {
      setError('Trebuie să ai cel puțin un pasager');
    }
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

    const bookingData = {
      train: {
        ...train,

        from: train.from || searchParams.from,
        to: train.to || searchParams.to,
        price: train.price,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime
      },
      passengers,
      paymentMethod,
      totalPrice: train.price * passengers.length,
      searchParams: {
        from: train.from || searchParams.from,
        to: train.to || searchParams.to,
        date: searchParams.date,
        passengers: passengers.length
      }
    };

    console.log('Saving booking data to sessionStorage:', {
      trainFrom: bookingData.train.from,
      trainTo: bookingData.train.to,
      trainPrice: bookingData.train.price,
      searchParamsFrom: bookingData.searchParams.from,
      searchParamsTo: bookingData.searchParams.to
    });

    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));

    navigate('/payment');
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
              <div className="section-header">
                <h2>Detalii pasageri</h2>
                <div className="passenger-actions">
                  <button
                    type="button"
                    className="btn-add-passenger"
                    onClick={handleAddPassenger}
                    disabled={train && passengers.length >= train.availableSeats}
                  >
                    + Adaugă pasager
                  </button>
                </div>
              </div>

              {passengers.map((_, index) => (
                <div key={index} className="passenger-form-wrapper">
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-passenger"
                      onClick={() => handleRemovePassenger(index)}
                      title="Elimină pasager"
                    >
                      ×
                    </button>
                  )}
                  <PassengerForm
                    passengerIndex={index}
                    onUpdate={handlePassengerUpdate}
                  />
                </div>
              ))}

              {train && passengers.length >= train.availableSeats && (
                <div className="info-message">
                  Ai atins numărul maxim de pasageri disponibili ({train.availableSeats})
                </div>
              )}
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
                  <Link to="/terms">termenii și condițiile</Link>
                  {' '}și{' '}
                  <Link to="/privacy">politica de confidențialitate</Link>
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
                Continuă la plată
              </button>
            </div>
          </form>
        </div>

        <aside className="booking-sidebar">
          <BookingSummary
            train={train}
            passengers={passengers.length}
            totalPrice={train ? train.price * passengers.length : 0}
          />
        </aside>
      </div>
    </div>
  );
};

export default BookingPage;


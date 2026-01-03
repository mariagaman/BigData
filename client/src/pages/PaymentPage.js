import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { createBooking, createPayment } from '../services/api';
import BookingSummary from '../components/BookingSummary';
import '../styles/PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { selectedTrain, searchParams, createBooking } = useBooking();
  const { user } = useAuth();
  
  const [pendingBooking, setPendingBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Date pentru card
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Date pentru PayPal
  const [paypalData, setPaypalData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Preia datele rezervării din sessionStorage
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      try {
        const booking = JSON.parse(storedBooking);
        setPendingBooking(booking);
        setPaymentMethod(booking.paymentMethod || 'card');
      } catch (error) {
        console.error('Error parsing pending booking:', error);
        navigate('/search');
      }
    } else if (!selectedTrain) {
      navigate('/search');
    }
  }, [selectedTrain, navigate]);

  const train = selectedTrain || (pendingBooking?.train);
  const passengers = pendingBooking?.passengers || [];

  if (!train) {
    return (
      <div className="payment-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Se încarcă...</p>
        </div>
      </div>
    );
  }

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Formatare automată pentru card number (spații la fiecare 4 cifre)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Max 16 cifre + 3 spații
    }
    
    // Formatare pentru expiry date (MM/YY)
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
      }
      if (formattedValue.length > 5) return;
    }
    
    // CVV doar 3 cifre
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }
    
    setCardData({ ...cardData, [name]: formattedValue });
    setError('');
  };

  const handlePaypalChange = (e) => {
    const { name, value } = e.target;
    setPaypalData({ ...paypalData, [name]: value });
    setError('');
  };

  const validateCard = () => {
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      return 'Numărul cardului trebuie să aibă 16 cifre';
    }
    if (!cardData.cardHolder || cardData.cardHolder.length < 3) {
      return 'Numele deținătorului este obligatoriu';
    }
    if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
      return 'Data expirării este obligatorie (MM/YY)';
    }
    if (!cardData.cvv || cardData.cvv.length !== 3) {
      return 'CVV-ul trebuie să aibă 3 cifre';
    }
    
    // Verificare simplă de validitate (fictivă)
    const month = parseInt(cardData.expiryDate.split('/')[0]);
    const year = parseInt('20' + cardData.expiryDate.split('/')[1]);
    const currentDate = new Date();
    const expiryDate = new Date(year, month - 1);
    
    if (expiryDate < currentDate) {
      return 'Cardul a expirat';
    }
    
    return null;
  };

  const validatePaypal = () => {
    if (!paypalData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalData.email)) {
      return 'Email PayPal invalid';
    }
    if (!paypalData.password || paypalData.password.length < 6) {
      return 'Parola PayPal este obligatorie';
    }
    return null;
  };

  const simulatePayment = async (method) => {
    // Simulare procesare plată
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulare verificare fictivă
        // Pentru card: verifică că numărul nu începe cu 0 sau 1 (simulare eșec)
        if (method === 'card') {
          const cardNumber = cardData.cardNumber.replace(/\s/g, '');
          if (cardNumber.startsWith('0') || cardNumber.startsWith('1')) {
            reject({ message: 'Plata a fost refuzată. Verifică datele cardului.' });
            return;
          }
        }
        
        // Pentru PayPal: verifică că email-ul nu este "fail@paypal.com"
        if (method === 'paypal') {
          if (paypalData.email.toLowerCase() === 'fail@paypal.com') {
            reject({ message: 'Autentificare PayPal eșuată. Verifică datele.' });
            return;
          }
        }
        
        // Simulare succes
        resolve({
          transactionId: 'TXN-' + Date.now(),
          status: 'completed',
          timestamp: new Date().toISOString()
        });
      }, 2000); // Simulare întârziere de 2 secunde
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validare
      let validationError = null;
      if (paymentMethod === 'card') {
        validationError = validateCard();
      } else if (paymentMethod === 'paypal') {
        validationError = validatePaypal();
      }

      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      // Simulare procesare plată
      const paymentResult = await simulatePayment(paymentMethod);

      // Pregătește datele pentru salvare
      const bookingData = {
        train: train,
        passengers: passengers,
        paymentMethod: paymentMethod,
        paymentDetails: paymentMethod === 'card' ? {
          last4: cardData.cardNumber.replace(/\s/g, '').slice(-4),
          type: 'card',
          cardHolder: cardData.cardHolder
        } : paymentMethod === 'paypal' ? {
          email: paypalData.email,
          type: 'paypal'
        } : {
          type: 'transfer'
        },
        paymentResult: paymentResult,
        totalPrice: train.price * searchParams.passengers,
        searchParams: searchParams
      };

      // Creează rezervarea în baza de date
      const bookingResponse = await createBooking({
        trainId: train.id,
        passengers: passengers.map(p => ({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          wagonNumber: p.wagonNumber || 1,
          seatNumber: p.seatNumber || '1A'
        })),
        paymentMethod: paymentMethod
      });

      // Creează plata în baza de date
      await createPayment({
        bookingId: bookingResponse.id,
        method: paymentMethod,
        transactionId: paymentResult.transactionId
      });
      
      // Șterge datele temporare
      sessionStorage.removeItem('pendingBooking');
      
      // Navigare la confirmare cu ID-ul rezervării
      navigate(`/confirmation?bookingId=${bookingResponse.id}`);
    } catch (error) {
      setError(error.message || 'Plata a eșuat. Te rugăm să încerci din nou.');
      setLoading(false);
    }
  };

  const totalPrice = train.price * searchParams.passengers;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-main">
          <h1>Finalizează plata</h1>
          <p className="payment-subtitle">Completează datele de plată pentru a finaliza rezervarea</p>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="payment-method-selector">
            <button
              type="button"
              className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              💳 Card bancar
            </button>
            <button
              type="button"
              className={`method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('paypal')}
            >
              🅿️ PayPal
            </button>
            <button
              type="button"
              className={`method-btn ${paymentMethod === 'transfer' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('transfer')}
            >
              🏦 Transfer bancar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            {paymentMethod === 'card' && (
              <div className="card-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">Număr card *</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={cardData.cardNumber}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardHolder">Nume deținător *</label>
                  <input
                    type="text"
                    id="cardHolder"
                    name="cardHolder"
                    value={cardData.cardHolder}
                    onChange={handleCardChange}
                    placeholder="ION POPESCU"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Data expirării *</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={cardData.expiryDate}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cvv">CVV *</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      placeholder="123"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>

                <div className="payment-info">
                  <p>💡 Pentru testare: folosește orice număr de card care NU începe cu 0 sau 1</p>
                  <p>Exemplu valid: 4532 1234 5678 9010</p>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="paypal-form">
                <div className="form-group">
                  <label htmlFor="paypalEmail">Email PayPal *</label>
                  <input
                    type="email"
                    id="paypalEmail"
                    name="email"
                    value={paypalData.email}
                    onChange={handlePaypalChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="paypalPassword">Parolă PayPal *</label>
                  <input
                    type="password"
                    id="paypalPassword"
                    name="password"
                    value={paypalData.password}
                    onChange={handlePaypalChange}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="payment-info">
                  <p>💡 Pentru testare: folosește orice email valid (NU "fail@paypal.com")</p>
                  <p>Exemplu valid: test@paypal.com</p>
                </div>
              </div>
            )}

            {paymentMethod === 'transfer' && (
              <div className="transfer-info">
                <div className="info-box">
                  <h3>Detalii transfer bancar</h3>
                  <p><strong>IBAN:</strong> RO49 AAAA 1B31 0075 9384 0000</p>
                  <p><strong>Beneficiar:</strong> RailMate SRL</p>
                  <p><strong>Suma:</strong> {totalPrice} RON</p>
                  <p><strong>Referință:</strong> REZ-{Date.now()}</p>
                  <p className="warning">⚠️ După efectuarea transferului, rezervarea va fi confirmată manual în 1-2 zile lucrătoare.</p>
                </div>
              </div>
            )}

            <div className="payment-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Înapoi
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>Se procesează plata...</span>
                  </>
                ) : (
                  <>
                    🔒 Plătește {totalPrice} RON
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <aside className="payment-sidebar">
          <BookingSummary
            train={train}
            passengers={searchParams.passengers}
            totalPrice={totalPrice}
          />
        </aside>
      </div>
    </div>
  );
};

export default PaymentPage;


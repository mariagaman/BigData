import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById } from '../services/api';
import jsPDF from 'jspdf';
import QRCodeLib from 'qrcode';
import '../styles/TicketPage.css';

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
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const bookingData = await getBookingById(bookingId);
        setBooking(bookingData);
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError(error.message || 'Biletul nu a fost găsit');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="ticket-page">
        <div className="ticket-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Se încarcă biletul...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="ticket-page">
        <div className="ticket-container">
          <div className="error-message">
            <h2>Biletul nu a fost găsit</h2>
            <p>{error || 'Biletul căutat nu există sau nu ai acces la el.'}</p>
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

  const ticketCode = booking.bookingNumber || `RAILMATE-${booking.id}-${booking.train.trainNumber}-${formatDateShort(booking.train.departureTime).replace(/\//g, '')}`;

  const qrData = JSON.stringify({
    bookingId: booking.id,
    bookingNumber: booking.bookingNumber || booking.id,
    trainNumber: booking.train.trainNumber,
    from: booking.train.from,
    to: booking.train.to,
    date: booking.train.departureTime,
    code: ticketCode
  });

  const qrCodeUrl = booking.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  const handlePrint = () => {
    window.print();
  };

  const removeDiacritics = (str) => {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ă/g, 'a')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/ș/g, 's')
      .replace(/ț/g, 't')
      .replace(/Ă/g, 'A')
      .replace(/Â/g, 'A')
      .replace(/Î/g, 'I')
      .replace(/Ș/g, 'S')
      .replace(/Ț/g, 'T');
  };

  const handleDownload = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [138, 43, 226];
      const textColor = [50, 50, 50];
      const lightGray = [240, 240, 240];

      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('RailMate', 15, 20);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Bilet #${booking.bookingNumber || booking.id}`, 150, 20);
      const statusText = booking.status === 'confirmed' ? 'Confirmat' :
                        booking.status === 'anulata' ? 'Anulat' : booking.status === 'confirmata' ? 'Confirmată' : booking.status;
      doc.text(`Status: ${removeDiacritics(statusText)}`, 150, 28);

      doc.setTextColor(...textColor);
      let yPos = 50;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalii calatorie', 15, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      doc.setFillColor(...lightGray);
      doc.rect(15, yPos, 85, 30, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('PLECARE', 20, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(removeDiacritics(booking.train.from), 20, yPos + 15);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(formatTime(booking.train.departureTime), 20, yPos + 22);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(removeDiacritics(formatDate(booking.train.departureTime)), 20, yPos + 28);

      doc.setFillColor(...lightGray);
      doc.rect(110, yPos, 85, 30, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('SOSIRE', 115, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(removeDiacritics(booking.train.to), 115, yPos + 15);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(formatTime(booking.train.arrivalTime), 115, yPos + 22);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(removeDiacritics(formatDate(booking.train.arrivalTime)), 115, yPos + 28);

      yPos += 40;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalii tren', 15, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tren: ${booking.train.type} ${booking.train.trainNumber}`, 15, yPos);
      yPos += 7;
      doc.text(`Pasageri: ${booking.passengers.length}`, 15, yPos);
      yPos += 7;
      doc.text(`Pret total: ${booking.totalPrice} RON`, 15, yPos);
      yPos += 7;
      const bookingDateStr = new Date(booking.bookingDate).toLocaleDateString('ro-RO');
      doc.text(`Data rezervarii: ${removeDiacritics(bookingDateStr)}`, 15, yPos);

      yPos += 15;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Cod QR Bilet', 15, yPos);
      yPos += 8;

      try {

        const qrDataString = booking.bookingNumber || booking.id.toString();
        const qrDataUrl = await QRCodeLib.toDataURL(qrDataString, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        doc.addImage(qrDataUrl, 'PNG', 15, yPos, 40, 40);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Cod bilet: ${booking.bookingNumber || booking.id}`, 60, yPos + 20);
      } catch (error) {
        console.error('Error generating QR code:', error);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Cod bilet: ${booking.bookingNumber || booking.id}`, 15, yPos + 5);
      }

      yPos += 50;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Pasageri', 15, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      booking.passengers.forEach((passenger, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        let passengerHeight = 8;
        if (passenger.email) passengerHeight += 5;
        if (passenger.phone) passengerHeight += 5;
        if (passenger.wagonNumber && passenger.seatNumber) passengerHeight += 5;

        doc.setFillColor(...lightGray);
        doc.rect(15, yPos - 5, 180, passengerHeight, 'F');

        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${removeDiacritics(passenger.firstName)} ${removeDiacritics(passenger.lastName)}`, 20, yPos + 3);
        doc.setFont('helvetica', 'normal');

        let passengerY = yPos + 8;
        if (passenger.email) {
          doc.text(`Email: ${passenger.email}`, 20, passengerY);
          passengerY += 5;
        }
        if (passenger.phone) {
          doc.text(`Telefon: ${passenger.phone}`, 20, passengerY);
          passengerY += 5;
        }
        if (passenger.wagonNumber && passenger.seatNumber) {
          doc.text(`Vagon: ${passenger.wagonNumber}, Loc: ${passenger.seatNumber}`, 20, passengerY);
          passengerY += 5;
        }

        yPos += passengerHeight + 3;
      });

      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);

        const footerText = 'Acest bilet este valabil doar pentru data si trenul specificat. Prezinta biletul la control.';
        const pageWidth = doc.internal.pageSize.getWidth();
        const textWidth = doc.getTextWidth(footerText);
        const xPos = (pageWidth - textWidth) / 2;

        doc.text(footerText, xPos, 285, { align: 'left' });
        doc.text(`Pagina ${i} din ${pageCount}`, 105, 290, { align: 'center' });
      }

      const fileName = `Bilet_${booking.bookingNumber || booking.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Eroare la generarea PDF-ului. Te rugam sa incerci din nou.');
    }
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
              <span className="number-value">{booking.bookingNumber || booking.id}</span>
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
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="qr-code-image"
                  onError={(e) => {

                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="qr-code-fallback" style={{ display: 'none' }}>
                  <QRCode value={qrData} />
                </div>
                <div className="qr-code-label">Cod bilet: {booking.bookingNumber || ticketCode}</div>
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
                    {passenger.email && (
                      <div className="passenger-email">{passenger.email}</div>
                    )}
                    {passenger.phone && (
                      <div className="passenger-phone">{passenger.phone}</div>
                    )}
                    {passenger.wagonNumber && passenger.seatNumber && (
                      <div className="passenger-seat">
                        Vagon {passenger.wagonNumber}, Loc {passenger.seatNumber}
                      </div>
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
              <p>Bilet generat: {new Date(booking.bookingDate).toLocaleString('ro-RO')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;

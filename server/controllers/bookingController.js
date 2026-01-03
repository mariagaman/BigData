const Booking = require('../models/Booking');
const Train = require('../models/Train');
const Station = require('../models/Station');
const Payment = require('../models/Payment');

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { trainId, passengers, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!trainId || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Date incomplete pentru rezervare'
      });
    }

    const train = await Train.findById(trainId)
      .populate('from', 'name')
      .populate('to', 'name');

    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Tren negăsit'
      });
    }

    // Calculează prețul total
    const totalPrice = train.price * passengers.length;

    // Creează snapshot-ul trenului
    // Asigură-te că from și to sunt populate sau obține numele din Station
    const Station = require('../models/Station');
    let fromName = train.from.name || train.from;
    let toName = train.to.name || train.to;
    
    // Dacă from/to sunt ObjectId-uri, populează-le
    if (typeof train.from === 'object' && train.from._id && !train.from.name) {
      const fromStation = await Station.findById(train.from._id || train.from);
      fromName = fromStation ? fromStation.name : 'N/A';
    }
    if (typeof train.to === 'object' && train.to._id && !train.to.name) {
      const toStation = await Station.findById(train.to._id || train.to);
      toName = toStation ? toStation.name : 'N/A';
    }
    
    const trainSnapshot = {
      trainNumber: train.trainNumber,
      type: train.type,
      from: fromName,
      to: toName,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      price: train.price
    };

    // Creează rezervarea
    const booking = new Booking({
      userId,
      train: trainId,
      trainSnapshot,
      passengers,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'pending',
      totalPrice,
      status: 'confirmed'
    });

    await booking.save();

    // Generează QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(booking.bookingNumber)}`;
    booking.qrCode = qrCodeUrl;
    await booking.save();

    res.status(201).json({
      success: true,
      booking: {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        train: trainSnapshot,
        passengers: booking.passengers,
        totalPrice: booking.totalPrice,
        status: booking.status,
        qrCode: booking.qrCode
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea rezervării'
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('getUserBookings - userId:', userId);
    console.log('getUserBookings - user email:', req.user.email);
    
    const bookings = await Booking.find({ userId })
      .populate({
        path: 'train',
        populate: {
          path: 'from to',
          select: 'name'
        }
      })
      .sort({ bookingDate: -1 });

    console.log('getUserBookings - found bookings:', bookings.length);
    
    // Log primul booking pentru debugging
    if (bookings.length > 0) {
      const firstBooking = bookings[0];
      console.log('First booking structure:', {
        hasTrainSnapshot: !!firstBooking.trainSnapshot,
        trainSnapshotType: typeof firstBooking.trainSnapshot,
        hasTrain: !!firstBooking.train,
        trainType: typeof firstBooking.train,
        trainIsObject: firstBooking.train && typeof firstBooking.train === 'object'
      });
    }

    const formattedBookings = bookings.map(booking => {
      // Folosește trainSnapshot dacă există și are date valide, altfel folosește datele din train populate
      let trainData;
      
      // Verifică dacă trainSnapshot are nume valide (nu "N/A" sau undefined)
      const hasValidSnapshot = booking.trainSnapshot && 
                               booking.trainSnapshot.trainNumber &&
                               booking.trainSnapshot.from &&
                               booking.trainSnapshot.from !== 'N/A' &&
                               booking.trainSnapshot.to &&
                               booking.trainSnapshot.to !== 'N/A';
      
      if (hasValidSnapshot) {
        // Folosește snapshot-ul salvat
        trainData = {
          trainNumber: booking.trainSnapshot.trainNumber,
          type: booking.trainSnapshot.type,
          from: booking.trainSnapshot.from,
          to: booking.trainSnapshot.to,
          departureTime: booking.trainSnapshot.departureTime,
          arrivalTime: booking.trainSnapshot.arrivalTime
        };
      } else if (booking.train && typeof booking.train === 'object' && booking.train.trainNumber) {
        // Folosește datele din tren populate
        const train = booking.train;
        const fromName = train.from?.name || 
                        (typeof train.from === 'string' ? train.from : null) ||
                        (train.from?._id ? 'Loading...' : 'N/A');
        const toName = train.to?.name || 
                      (typeof train.to === 'string' ? train.to : null) ||
                      (train.to?._id ? 'Loading...' : 'N/A');
        
        trainData = {
          trainNumber: train.trainNumber,
          type: train.type,
          from: fromName,
          to: toName,
          departureTime: train.departureTime,
          arrivalTime: train.arrivalTime
        };
      } else {
        // Fallback - date incomplete
        console.warn('Booking without trainSnapshot or train data:', booking._id);
        trainData = {
          trainNumber: booking.trainSnapshot?.trainNumber || 'N/A',
          type: booking.trainSnapshot?.type || 'N/A',
          from: booking.trainSnapshot?.from || 'N/A',
          to: booking.trainSnapshot?.to || 'N/A',
          departureTime: booking.trainSnapshot?.departureTime || booking.bookingDate,
          arrivalTime: booking.trainSnapshot?.arrivalTime || booking.bookingDate
        };
      }

      return {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        train: trainData,
        passengers: booking.passengers || [],
        totalPrice: booking.totalPrice,
        status: booking.status,
        bookingDate: booking.bookingDate,
        qrCode: booking.qrCode
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea rezervărilor'
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'train',
        populate: {
          path: 'from to',
          select: 'name'
        }
      })
      .populate('userId', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervare negăsită'
      });
    }

    // Verifică dacă utilizatorul are dreptul să vadă această rezervare
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu ai permisiunea să accesezi această rezervare'
      });
    }

    // Folosește trainSnapshot dacă există și are date valide, altfel folosește datele din train populate
    let trainData;
    
    // Verifică dacă trainSnapshot are nume valide (nu "N/A" sau undefined)
    const hasValidSnapshot = booking.trainSnapshot && 
                             booking.trainSnapshot.trainNumber &&
                             booking.trainSnapshot.from &&
                             booking.trainSnapshot.from !== 'N/A' &&
                             booking.trainSnapshot.to &&
                             booking.trainSnapshot.to !== 'N/A';
    
    if (hasValidSnapshot) {
      // Folosește snapshot-ul salvat
      trainData = {
        trainNumber: booking.trainSnapshot.trainNumber,
        type: booking.trainSnapshot.type,
        from: booking.trainSnapshot.from,
        to: booking.trainSnapshot.to,
        departureTime: booking.trainSnapshot.departureTime,
        arrivalTime: booking.trainSnapshot.arrivalTime
      };
    } else if (booking.train && typeof booking.train === 'object' && booking.train.trainNumber) {
      // Folosește datele din tren populate
      const train = booking.train;
      const fromName = train.from?.name || 
                      (typeof train.from === 'string' ? train.from : null) ||
                      (train.from?._id ? 'Loading...' : 'N/A');
      const toName = train.to?.name || 
                    (typeof train.to === 'string' ? train.to : null) ||
                    (train.to?._id ? 'Loading...' : 'N/A');
      
      trainData = {
        trainNumber: train.trainNumber,
        type: train.type,
        from: fromName,
        to: toName,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime
      };
    } else {
      // Fallback - date incomplete
      console.warn('Booking without trainSnapshot or train data:', booking._id);
      trainData = {
        trainNumber: booking.trainSnapshot?.trainNumber || 'N/A',
        type: booking.trainSnapshot?.type || 'N/A',
        from: booking.trainSnapshot?.from || 'N/A',
        to: booking.trainSnapshot?.to || 'N/A',
        departureTime: booking.trainSnapshot?.departureTime || booking.bookingDate,
        arrivalTime: booking.trainSnapshot?.arrivalTime || booking.bookingDate
      };
    }

    // Generează QR code dacă nu există
    let qrCode = booking.qrCode;
    if (!qrCode) {
      qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(booking.bookingNumber || booking._id.toString())}`;
      // Salvează QR code-ul generat în baza de date
      booking.qrCode = qrCode;
      await booking.save();
    }

    const formattedBooking = {
      id: booking._id,
      bookingNumber: booking.bookingNumber,
      train: trainData,
      passengers: booking.passengers,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      bookingDate: booking.bookingDate,
      qrCode: qrCode
    };

    res.json({
      success: true,
      booking: formattedBooking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea rezervării'
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervare negăsită'
      });
    }

    // Verifică dacă utilizatorul are dreptul să anuleze această rezervare
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu ai permisiunea să anulezi această rezervare'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Rezervarea este deja anulată'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationDate = new Date();
    await booking.save();

    // Actualizează și plata dacă există
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (payment && payment.status === 'completed') {
      payment.status = 'refunded';
      payment.refundDate = new Date();
      payment.refundAmount = payment.amount;
      await payment.save();
    }

    res.json({
      success: true,
      message: 'Rezervare anulată cu succes',
      booking: {
        id: booking._id,
        status: booking.status,
        cancellationDate: booking.cancellationDate
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la anularea rezervării'
    });
  }
};


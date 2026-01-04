const Booking = require('../models/Booking');
const Train = require('../models/Train');
const Station = require('../models/Station');
const Payment = require('../models/Payment');

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { trainId, passengers, paymentMethod, from, to, departureTime, arrivalTime, price } = req.body;
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

    // Obține toate rezervările existente pentru a calcula locurile ocupate
    const existingBookings = await Booking.find({
      train: trainId,
      status: 'confirmata',
      paymentStatus: 'finalizat'
    });

    // Creează un set cu locurile ocupate
    const occupiedSeats = new Set();
    existingBookings.forEach(booking => {
      if (booking.passengers && Array.isArray(booking.passengers)) {
        booking.passengers.forEach(passenger => {
          const key = `${passenger.wagonNumber}-${passenger.seatNumber}`;
          occupiedSeats.add(key);
        });
      }
    });

    // Funcție pentru a găsi următorul loc disponibil
    const findNextAvailableSeat = (startWagon = 1, startSeatIndex = 0) => {
      // Sortează vagoanele după număr
      const sortedWagons = [...(train.wagons || [])].sort((a, b) => a.wagonNumber - b.wagonNumber);
      
      // Începe de la vagonul specificat
      for (let w = sortedWagons.findIndex(w => w.wagonNumber >= startWagon); w < sortedWagons.length; w++) {
        const wagon = sortedWagons[w];
        if (!wagon.seats || wagon.seats.length === 0) continue;
        
        // Sortează scaunele (presupunând că sunt în ordine)
        const sortedSeats = [...wagon.seats].sort((a, b) => {
          // Compară scaunele (ex: "1A" < "1B" < "2A")
          return a.seatNumber.localeCompare(b.seatNumber);
        });
        
        // Dacă e primul vagon, începe de la startSeatIndex, altfel de la început
        const startIndex = (w === 0 && startWagon === sortedWagons[0].wagonNumber) ? startSeatIndex : 0;
        
        for (let s = startIndex; s < sortedSeats.length; s++) {
          const seat = sortedSeats[s];
          const key = `${wagon.wagonNumber}-${seat.seatNumber}`;
          if (!occupiedSeats.has(key)) {
            return { wagonNumber: wagon.wagonNumber, seatNumber: seat.seatNumber };
          }
        }
      }
      
      return null; // Nu mai sunt locuri disponibile
    };

    // Procesează fiecare pasager și alocă locuri
    const assignedSeats = [];
    const seatAllocationErrors = [];
    
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      let assignedSeat = null;
      
      // Dacă pasagerul are deja vagon și scaun specificat
      if (passenger.wagonNumber && passenger.seatNumber) {
        // Verifică dacă vagonul există
        const wagon = train.wagons?.find(w => w.wagonNumber === passenger.wagonNumber);
        if (!wagon) {
          seatAllocationErrors.push(
            `Vagonul ${passenger.wagonNumber} nu există în trenul ${train.trainNumber}`
          );
          // Alocă automat un loc disponibil
          assignedSeat = findNextAvailableSeat();
        } else {
          // Verifică dacă scaunul există în vagon
          const seat = wagon.seats?.find(s => s.seatNumber === passenger.seatNumber);
          if (!seat) {
            seatAllocationErrors.push(
              `Scaunul ${passenger.seatNumber} nu există în vagonul ${passenger.wagonNumber}`
            );
            // Alocă automat un loc disponibil din același vagon
            const wagonSeats = wagon.seats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
            const seatIndex = wagonSeats.findIndex(s => s.seatNumber === passenger.seatNumber);
            assignedSeat = findNextAvailableSeat(passenger.wagonNumber, seatIndex + 1);
            if (!assignedSeat) {
              // Dacă nu mai sunt locuri în vagon, caută în următorul
              assignedSeat = findNextAvailableSeat(passenger.wagonNumber + 1, 0);
            }
          } else {
            // Verifică dacă locul este disponibil
            const key = `${passenger.wagonNumber}-${passenger.seatNumber}`;
            if (occupiedSeats.has(key)) {
              // Locul este ocupat, alocă automat următorul disponibil
              assignedSeat = findNextAvailableSeat(passenger.wagonNumber);
              if (!assignedSeat) {
                // Dacă nu mai sunt locuri în vagon, caută în următorul
                assignedSeat = findNextAvailableSeat(passenger.wagonNumber + 1, 0);
              }
            } else {
              // Locul este disponibil
              assignedSeat = { wagonNumber: passenger.wagonNumber, seatNumber: passenger.seatNumber };
            }
          }
        }
      } else {
        // Pasagerul nu are loc specificat, alocă automat
        const lastAssigned = assignedSeats[assignedSeats.length - 1];
        if (lastAssigned) {
          // Continuă de la ultimul loc alocat
          assignedSeat = findNextAvailableSeat(lastAssigned.wagonNumber);
          if (!assignedSeat) {
            assignedSeat = findNextAvailableSeat(lastAssigned.wagonNumber + 1, 0);
          }
        } else {
          // Primul pasager, începe de la primul vagon
          assignedSeat = findNextAvailableSeat(1, 0);
        }
      }
      
      if (!assignedSeat) {
        return res.status(400).json({
          success: false,
          message: `Nu mai sunt locuri disponibile în tren. Am alocat ${assignedSeats.length} din ${passengers.length} locuri.`,
          assignedSeats: assignedSeats.length
        });
      }
      
      assignedSeats.push(assignedSeat);
    }

    // Actualizează pasagerii cu locurile alocate
    const passengersWithSeats = passengers.map((passenger, index) => ({
      ...passenger,
      wagonNumber: assignedSeats[index].wagonNumber,
      seatNumber: assignedSeats[index].seatNumber
    }));

    if (seatAllocationErrors.length > 0) {
      console.log('Seat allocation warnings:', seatAllocationErrors);
    }

    console.log(`Creating booking for train ${train.trainNumber}: ${passengers.length} passengers`);
    console.log(`Assigned seats:`, assignedSeats);
    console.log(`Currently occupied seats:`, Array.from(occupiedSeats));

    // Folosește stațiile și prețul trimise de frontend (care pot fi pentru secțiune intermediară)
    // IMPORTANT: Prioritizează datele trimise de frontend (from, to, price) care sunt pentru secțiunea reală căutată
    const Station = require('../models/Station');
    
    // Folosește întotdeauna datele trimise de frontend dacă există (sunt pentru secțiunea intermediară)
    let actualFrom = from;
    let actualTo = to;
    let actualDepartureTime = departureTime ? new Date(departureTime) : train.departureTime;
    let actualArrivalTime = arrivalTime ? new Date(arrivalTime) : train.arrivalTime;
    let actualPrice = price;
    
    // Fallback doar dacă nu sunt trimise date de frontend
    if (!actualFrom) {
      actualFrom = train.from.name || train.from;
    }
    if (!actualTo) {
      actualTo = train.to.name || train.to;
    }
    if (!actualPrice) {
      actualPrice = train.price;
    }
    
    console.log('Booking data received:', {
      fromParam: from,
      toParam: to,
      priceParam: price,
      actualFrom: actualFrom,
      actualTo: actualTo,
      actualPrice: actualPrice,
      trainFrom: train.from.name || train.from,
      trainTo: train.to.name || train.to,
      trainPrice: train.price
    });
    
    // Dacă from/to sunt string-uri (nume stații), le folosim direct
    // Dacă sunt ObjectId-uri, le populează
    if (typeof actualFrom === 'object' && actualFrom._id) {
      if (!actualFrom.name) {
        const fromStation = await Station.findById(actualFrom._id);
        actualFrom = fromStation ? fromStation.name : 'N/A';
      } else {
        actualFrom = actualFrom.name;
      }
    }
    if (typeof actualTo === 'object' && actualTo._id) {
      if (!actualTo.name) {
        const toStation = await Station.findById(actualTo._id);
        actualTo = toStation ? toStation.name : 'N/A';
      } else {
        actualTo = actualTo.name;
      }
    }
    
    // Dacă nu s-a trimis preț de la frontend, calculează-l pentru secțiunea intermediară
    if (!price && train.route && train.route.intermediateStations && train.route.intermediateStations.length > 0) {
      // Găsește stațiile în ruta intermediară
      const intermediateStations = train.route.intermediateStations;
      
      // Găsește index-ul stației de plecare
      const fromStationObj = await Station.findOne({ name: actualFrom });
      const toStationObj = await Station.findOne({ name: actualTo });
      
      if (fromStationObj && toStationObj) {
        const fromIndex = intermediateStations.findIndex(
          s => s.station && s.station.toString() === fromStationObj._id.toString()
        );
        const toIndex = intermediateStations.findIndex(
          s => s.station && s.station.toString() === toStationObj._id.toString()
        );
        
        // Dacă ambele stații sunt în ruta intermediară, calculează prețul proporțional
        if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
          const fromDistance = intermediateStations[fromIndex].distanceFromStart;
          const toDistance = intermediateStations[toIndex].distanceFromStart;
          const segmentDistance = toDistance - fromDistance;
          const fullDistance = intermediateStations[intermediateStations.length - 1]?.distanceFromStart || 1;
          actualPrice = fullDistance > 0 ? (train.price * segmentDistance / fullDistance) : train.price;
          console.log('Calculated price for intermediate section:', {
            fromDistance,
            toDistance,
            segmentDistance,
            fullDistance,
            trainPrice: train.price,
            calculatedPrice: actualPrice
          });
        }
        // Dacă pleacă din stația principală și ajunge într-o stație intermediară
        else if (train.from._id.toString() === fromStationObj._id.toString() && toIndex !== -1) {
          const totalDistance = intermediateStations[toIndex].distanceFromStart;
          const fullDistance = intermediateStations[intermediateStations.length - 1]?.distanceFromStart || totalDistance;
          actualPrice = fullDistance > 0 ? (train.price * totalDistance / fullDistance) : train.price;
          console.log('Calculated price from main station to intermediate:', actualPrice);
        }
        // Dacă pleacă dintr-o stație intermediară și ajunge în stația principală
        else if (fromIndex !== -1 && train.to._id.toString() === toStationObj._id.toString()) {
          const fromDistance = intermediateStations[fromIndex].distanceFromStart;
          const fullDistance = intermediateStations[intermediateStations.length - 1]?.distanceFromStart || 1;
          const remainingDistance = fullDistance - fromDistance;
          actualPrice = fullDistance > 0 ? (train.price * remainingDistance / fullDistance) : train.price;
          console.log('Calculated price from intermediate to main station:', actualPrice);
        }
      }
    }
    
    // Calculează prețul total folosind prețul corect pentru secțiunea călătorită
    const totalPrice = actualPrice * passengers.length;
    
    // Creează snapshot-ul trenului cu datele reale (inclusiv pentru secțiuni intermediare)
    const trainSnapshot = {
      trainNumber: train.trainNumber,
      type: train.type,
      from: actualFrom,
      to: actualTo,
      departureTime: actualDepartureTime,
      arrivalTime: actualArrivalTime,
      price: Math.round(actualPrice * 100) / 100 // Rotunjire la 2 zecimale
    };
    
    console.log('Creating booking with:', {
      trainNumber: train.trainNumber,
      from: actualFrom,
      to: actualTo,
      price: trainSnapshot.price,
      totalPrice: totalPrice,
      passengers: passengers.length
    });
    
    console.log('TrainSnapshot to be saved:', JSON.stringify(trainSnapshot, null, 2));

    // Generează bookingNumber
    const generateBookingNumber = () => {
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 6).toUpperCase();
      return `REZ-${year}-${String(timestamp).slice(-6)}${random}`;
    };

    // Creează rezervarea cu locurile alocate
    const booking = new Booking({
      bookingNumber: generateBookingNumber(),
      userId,
      train: trainId,
      trainSnapshot,
      passengers: passengersWithSeats,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'finalizat',
      totalPrice,
      status: 'confirmata'
    });

    console.log('Booking object before save:', {
      bookingNumber: booking.bookingNumber,
      trainSnapshot: booking.trainSnapshot,
      from: booking.trainSnapshot.from,
      to: booking.trainSnapshot.to,
      price: booking.trainSnapshot.price
    });

    await booking.save();
    
    console.log('Booking saved successfully:', {
      id: booking._id,
      bookingNumber: booking.bookingNumber,
      trainSnapshotFrom: booking.trainSnapshot.from,
      trainSnapshotTo: booking.trainSnapshot.to,
      trainSnapshotPrice: booking.trainSnapshot.price
    });

    // Generează QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(booking.bookingNumber)}`;
    booking.qrCode = qrCodeUrl;
    await booking.save();

    const bookingResponse = {
      success: true,
      booking: {
        id: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
        train: trainSnapshot,
        passengers: booking.passengers,
        totalPrice: booking.totalPrice,
        status: booking.status,
        qrCode: booking.qrCode
      }
    };

    console.log('Create booking response - booking ID:', bookingResponse.booking.id, 'type:', typeof bookingResponse.booking.id);
    
    res.status(201).json(bookingResponse);
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
      
      // Verifică dacă trainSnapshot există și are structură validă
      const hasValidSnapshot = booking.trainSnapshot && 
                               typeof booking.trainSnapshot === 'object' &&
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
        arrivalTime: booking.trainSnapshot.arrivalTime,
        price: booking.trainSnapshot.price
      };
      
      console.log('getBookingById - using trainSnapshot:', trainData);
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
        paymentStatus: booking.paymentStatus,
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
    
    console.log('getBookingById - checking trainSnapshot:', {
      hasTrainSnapshot: !!booking.trainSnapshot,
      trainSnapshot: booking.trainSnapshot,
      trainSnapshotFrom: booking.trainSnapshot?.from,
      trainSnapshotTo: booking.trainSnapshot?.to
    });
    
    // Verifică dacă trainSnapshot are nume valide (nu "N/A" sau undefined)
    const hasValidSnapshot = booking.trainSnapshot && 
                             booking.trainSnapshot.trainNumber &&
                             booking.trainSnapshot.from &&
                             booking.trainSnapshot.from !== 'N/A' &&
                             booking.trainSnapshot.to &&
                             booking.trainSnapshot.to !== 'N/A';
    
    console.log('getBookingById - hasValidSnapshot:', hasValidSnapshot);
    
    if (hasValidSnapshot) {
      // Folosește snapshot-ul salvat (care conține datele pentru secțiunea intermediară)
      trainData = {
        trainNumber: booking.trainSnapshot.trainNumber,
        type: booking.trainSnapshot.type,
        from: booking.trainSnapshot.from,
        to: booking.trainSnapshot.to,
        departureTime: booking.trainSnapshot.departureTime,
        arrivalTime: booking.trainSnapshot.arrivalTime,
        price: booking.trainSnapshot.price
      };
      
      console.log('getBookingById - using trainSnapshot:', trainData);
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
    
    console.log('getBookingById - returning booking with train data:', {
      from: formattedBooking.train.from,
      to: formattedBooking.train.to,
      price: formattedBooking.train.price
    });

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
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Nu ai permisiunea să anulezi această rezervare'
      });
    }

    if (booking.status === 'anulata') {
      return res.status(400).json({
        success: false,
        message: 'Rezervarea este deja anulată'
      });
    }

    booking.status = 'anulata';
    booking.paymentStatus = 'rambursat';
    booking.cancellationDate = new Date();
    booking.cancellationReason = 'Renuntare voluntara';
    await booking.save();

    // Actualizează și plata dacă există
    const Payment = require('../models/Payment');
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (payment && payment.status === 'finalizat') {
      payment.status = 'rambursat';
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


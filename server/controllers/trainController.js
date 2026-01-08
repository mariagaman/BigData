const Train = require('../models/Train');
const Station = require('../models/Station');
const Booking = require('../models/Booking');

exports.searchTrains = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    console.log('Search trains - params:', { from, to, date });

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Te rugăm să specifici stația de plecare și sosire'
      });
    }

    const fromStation = await Station.findOne({ name: from });
    const toStation = await Station.findOne({ name: to });

    console.log('Found stations:', {
      fromStation: fromStation ? { id: fromStation._id, name: fromStation.name } : null,
      toStation: toStation ? { id: toStation._id, name: toStation.name } : null
    });

    if (!fromStation || !toStation) {
      return res.status(404).json({
        success: false,
        message: 'Una sau ambele stații nu au fost găsite'
      });
    }

    const directQuery = {
      from: fromStation._id,
      to: toStation._id
    };

    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      directQuery.departureTime = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    console.log('Direct query:', JSON.stringify(directQuery, null, 2));
    const directTrains = await Train.find(directQuery)
      .populate('from', 'name city')
      .populate('to', 'name city')
      .populate('route.intermediateStations.station', 'name city')
      .sort({ departureTime: 1 });

    console.log(`Found ${directTrains.length} direct trains`);

    const intermediateQuery = {
      $or: [

        {
          from: fromStation._id,
          'route.intermediateStations.station': toStation._id
        },

        {
          'route.intermediateStations.station': fromStation._id,
          to: toStation._id
        },

        {
          'route.intermediateStations.station': {
            $all: [fromStation._id, toStation._id]
          }
        }
      ]
    };

    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      intermediateQuery.departureTime = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    console.log('Intermediate query:', JSON.stringify(intermediateQuery, null, 2));
    const intermediateTrains = await Train.find(intermediateQuery)
      .populate('from', 'name city')
      .populate('to', 'name city')
      .populate('route.intermediateStations.station', 'name city')
      .sort({ departureTime: 1 });

    console.log(`Found ${intermediateTrains.length} trains with intermediate stations`);

    const allTrains = [...directTrains];
    const trainIds = new Set(directTrains.map(t => t._id.toString()));

    intermediateTrains.forEach(train => {
      if (!trainIds.has(train._id.toString())) {
        allTrains.push(train);
        trainIds.add(train._id.toString());
      }
    });

    const trains = allTrains.filter(train => {

      if (train.from._id.toString() === fromStation._id.toString() &&
          train.to._id.toString() === toStation._id.toString()) {
        return true;
      }

      if (!train.route || !train.route.intermediateStations || train.route.intermediateStations.length === 0) {
        return false;
      }

      const intermediateStations = train.route.intermediateStations;
      const fromIndex = intermediateStations.findIndex(
        s => s.station && s.station._id && s.station._id.toString() === fromStation._id.toString()
      );
      const toIndex = intermediateStations.findIndex(
        s => s.station && s.station._id && s.station._id.toString() === toStation._id.toString()
      );

      if (train.from._id.toString() === fromStation._id.toString() && toIndex !== -1) {
        return true;
      }

      if (fromIndex !== -1 && train.to._id.toString() === toStation._id.toString()) {
        return true;
      }

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
        return true;
      }

      return false;
    });

    console.log(`Total trains after filtering: ${trains.length}`);

    const trainsWithAvailability = await Promise.all(
      trains.map(async (train) => {

        const confirmedBookings = await Booking.find({
          train: train._id,
          status: 'confirmata',
          paymentStatus: 'finalizat'
        });

        console.log(`Train ${train.trainNumber}: Found ${confirmedBookings.length} confirmed bookings`);

        const bookedSeats = confirmedBookings.reduce((total, booking) => {
          const passengersCount = booking.passengers ? booking.passengers.length : 0;
          console.log(`  Booking ${booking.bookingNumber}: ${passengersCount} passengers`);
          return total + passengersCount;
        }, 0);

        const availableSeats = Math.max(0, train.totalSeats - bookedSeats);

        console.log(`Train ${train.trainNumber}: Total seats: ${train.totalSeats}, Booked: ${bookedSeats}, Available: ${availableSeats}`);

        return {
          ...train.toObject(),
          availableSeats
        };
      })
    );

    const formattedTrains = trainsWithAvailability.map(train => {
      let actualFrom = train.from.name;
      let actualTo = train.to.name;
      let actualDepartureTime = train.departureTime;
      let actualArrivalTime = train.arrivalTime;
      let actualPrice = train.price;

      if (train.route && train.route.intermediateStations && train.route.intermediateStations.length > 0) {
        const intermediateStations = train.route.intermediateStations;
        const fromIndex = intermediateStations.findIndex(
          s => s.station && s.station._id && s.station._id.toString() === fromStation._id.toString()
        );
        const toIndex = intermediateStations.findIndex(
          s => s.station && s.station._id && s.station._id.toString() === toStation._id.toString()
        );

        if (train.from._id.toString() === fromStation._id.toString() && toIndex !== -1) {
          actualFrom = train.from.name;
          actualTo = intermediateStations[toIndex].station.name;
          actualDepartureTime = train.departureTime;
          actualArrivalTime = intermediateStations[toIndex].arrivalTime;

          const totalDistance = intermediateStations[toIndex].distanceFromStart;
          const fullDistance = train.route.intermediateStations[train.route.intermediateStations.length - 1]?.distanceFromStart || totalDistance;
          actualPrice = fullDistance > 0 ? Math.round((train.price * totalDistance / fullDistance) * 100) / 100 : train.price;
          console.log(`Price calculation (case 1): trainPrice=${train.price}, totalDistance=${totalDistance}, fullDistance=${fullDistance}, calculatedPrice=${actualPrice}`);
        }

        else if (fromIndex !== -1 && train.to._id.toString() === toStation._id.toString()) {
          actualFrom = intermediateStations[fromIndex].station.name;
          actualTo = train.to.name;
          actualDepartureTime = intermediateStations[fromIndex].departureTime;
          actualArrivalTime = train.arrivalTime;

          const fromDistance = intermediateStations[fromIndex].distanceFromStart;
          const lastIntermediateDistance = intermediateStations[intermediateStations.length - 1]?.distanceFromStart || fromDistance;

          if (fromIndex === intermediateStations.length - 1) {

            const totalTime = train.arrivalTime.getTime() - train.departureTime.getTime();
            const remainingTime = train.arrivalTime.getTime() - intermediateStations[fromIndex].departureTime.getTime();
            const timeRatio = totalTime > 0 ? remainingTime / totalTime : 0.1;
            actualPrice = Math.round((train.price * timeRatio) * 100) / 100;
            console.log(`Price calculation (case 2 - last intermediate): trainPrice=${train.price}, totalTime=${totalTime}ms, remainingTime=${remainingTime}ms, timeRatio=${timeRatio}, calculatedPrice=${actualPrice}`);
          } else {

            const estimatedFinalSegment = lastIntermediateDistance * 0.15;
            const totalEstimatedDistance = lastIntermediateDistance + estimatedFinalSegment;
            const actualRemainingDistance = totalEstimatedDistance - fromDistance;
            actualPrice = totalEstimatedDistance > 0 ? Math.round((train.price * actualRemainingDistance / totalEstimatedDistance) * 100) / 100 : train.price;
            console.log(`Price calculation (case 2): trainPrice=${train.price}, fromDistance=${fromDistance}, lastIntermediateDistance=${lastIntermediateDistance}, estimatedFinalSegment=${estimatedFinalSegment}, totalEstimatedDistance=${totalEstimatedDistance}, actualRemainingDistance=${actualRemainingDistance}, calculatedPrice=${actualPrice}`);
          }
        }

        else if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
          actualFrom = intermediateStations[fromIndex].station.name;
          actualTo = intermediateStations[toIndex].station.name;
          actualDepartureTime = intermediateStations[fromIndex].departureTime;
          actualArrivalTime = intermediateStations[toIndex].arrivalTime;

          const fromDistance = intermediateStations[fromIndex].distanceFromStart;
          const toDistance = intermediateStations[toIndex].distanceFromStart;
          const segmentDistance = toDistance - fromDistance;
          const fullDistance = intermediateStations[intermediateStations.length - 1]?.distanceFromStart || 1;
          actualPrice = fullDistance > 0 ? Math.round((train.price * segmentDistance / fullDistance) * 100) / 100 : train.price;
          console.log(`Price calculation (case 3): trainPrice=${train.price}, fromDistance=${fromDistance}, toDistance=${toDistance}, segmentDistance=${segmentDistance}, fullDistance=${fullDistance}, calculatedPrice=${actualPrice}`);
        }
      }

      return {
        id: train._id,
        trainNumber: train.trainNumber,
        type: train.type,
        from: actualFrom,
        to: actualTo,
        departureTime: actualDepartureTime,
        arrivalTime: actualArrivalTime,
        price: Math.round(actualPrice * 100) / 100,
        availableSeats: train.availableSeats,
        stops: train.stops,
        amenities: train.amenities || [],
        wagons: train.wagons || []
      };
    });

    res.json({
      success: true,
      trains: formattedTrains
    });
  } catch (error) {
    console.error('Search trains error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la căutarea trenurilor'
    });
  }
};

exports.getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id)
      .populate('from', 'name city')
      .populate('to', 'name city')
      .populate('route.intermediateStations.station', 'name city');

    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Tren negăsit'
      });
    }

    const confirmedBookings = await Booking.find({
      train: train._id,
      status: 'confirmata',
      paymentStatus: 'finalizat'
    });

    console.log(`GetTrainById ${train.trainNumber}: Found ${confirmedBookings.length} confirmed bookings`);

    const bookedSeats = confirmedBookings.reduce((total, booking) => {
      const passengersCount = booking.passengers ? booking.passengers.length : 0;
      console.log(`  Booking ${booking.bookingNumber}: ${passengersCount} passengers`);
      return total + passengersCount;
    }, 0);

    const availableSeats = Math.max(0, train.totalSeats - bookedSeats);

    console.log(`GetTrainById ${train.trainNumber}: Total seats: ${train.totalSeats}, Booked: ${bookedSeats}, Available: ${availableSeats}`);

    let actualFrom = train.from.name;
    let actualTo = train.to.name;
    let actualDepartureTime = train.departureTime;
    let actualArrivalTime = train.arrivalTime;
    let actualPrice = train.price;

    const { from, to } = req.query;
    if (from && to) {
      console.log(`GetTrainById - calculating intermediate segment: ${from} -> ${to}`);

      const Station = require('../models/Station');
      const fromStation = await Station.findOne({ name: from });
      const toStation = await Station.findOne({ name: to });

      if (fromStation && toStation && train.route && train.route.intermediateStations && train.route.intermediateStations.length > 0) {
        const intermediateStations = train.route.intermediateStations;
        const fromIndex = intermediateStations.findIndex(
          s => s.station && s.station._id && s.station._id.toString() === fromStation._id.toString()
        );
        const toIndex = intermediateStations.findIndex(
          s => s.station && s.station._id && s.station._id.toString() === toStation._id.toString()
        );

        if (train.from._id.toString() === fromStation._id.toString() && toIndex !== -1) {
          actualFrom = train.from.name;
          actualTo = intermediateStations[toIndex].station.name;
          actualDepartureTime = train.departureTime;
          actualArrivalTime = intermediateStations[toIndex].arrivalTime;
          const totalDistance = intermediateStations[toIndex].distanceFromStart;
          const fullDistance = intermediateStations[intermediateStations.length - 1]?.distanceFromStart || totalDistance;
          actualPrice = fullDistance > 0 ? Math.round((train.price * totalDistance / fullDistance) * 100) / 100 : train.price;
          console.log(`GetTrainById - Price calculation (case 1): trainPrice=${train.price}, totalDistance=${totalDistance}, fullDistance=${fullDistance}, calculatedPrice=${actualPrice}`);
        }

        else if (fromIndex !== -1 && train.to._id.toString() === toStation._id.toString()) {
          actualFrom = intermediateStations[fromIndex].station.name;
          actualTo = train.to.name;
          actualDepartureTime = intermediateStations[fromIndex].departureTime;
          actualArrivalTime = train.arrivalTime;
          const fromDistance = intermediateStations[fromIndex].distanceFromStart;
          const lastIntermediateDistance = intermediateStations[intermediateStations.length - 1]?.distanceFromStart || fromDistance;

          if (fromIndex === intermediateStations.length - 1) {

            const totalTime = train.arrivalTime.getTime() - train.departureTime.getTime();
            const remainingTime = train.arrivalTime.getTime() - intermediateStations[fromIndex].departureTime.getTime();
            const timeRatio = totalTime > 0 ? remainingTime / totalTime : 0.1;
            actualPrice = Math.round((train.price * timeRatio) * 100) / 100;
            console.log(`GetTrainById - Price calculation (case 2 - last intermediate): trainPrice=${train.price}, totalTime=${totalTime}ms, remainingTime=${remainingTime}ms, timeRatio=${timeRatio}, calculatedPrice=${actualPrice}`);
          } else {

            const estimatedFinalSegment = lastIntermediateDistance * 0.15;
            const totalEstimatedDistance = lastIntermediateDistance + estimatedFinalSegment;
            const actualRemainingDistance = totalEstimatedDistance - fromDistance;
            actualPrice = totalEstimatedDistance > 0 ? Math.round((train.price * actualRemainingDistance / totalEstimatedDistance) * 100) / 100 : train.price;
            console.log(`GetTrainById - Price calculation (case 2): trainPrice=${train.price}, fromDistance=${fromDistance}, lastIntermediateDistance=${lastIntermediateDistance}, estimatedFinalSegment=${estimatedFinalSegment}, totalEstimatedDistance=${totalEstimatedDistance}, actualRemainingDistance=${actualRemainingDistance}, calculatedPrice=${actualPrice}`);
          }
        }

        else if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
          actualFrom = intermediateStations[fromIndex].station.name;
          actualTo = intermediateStations[toIndex].station.name;
          actualDepartureTime = intermediateStations[fromIndex].departureTime;
          actualArrivalTime = intermediateStations[toIndex].arrivalTime;
          const fromDistance = intermediateStations[fromIndex].distanceFromStart;
          const toDistance = intermediateStations[toIndex].distanceFromStart;
          const segmentDistance = toDistance - fromDistance;
          const fullDistance = intermediateStations[intermediateStations.length - 1]?.distanceFromStart || 1;
          actualPrice = fullDistance > 0 ? Math.round((train.price * segmentDistance / fullDistance) * 100) / 100 : train.price;
          console.log(`GetTrainById - Price calculation (case 3): trainPrice=${train.price}, fromDistance=${fromDistance}, toDistance=${toDistance}, segmentDistance=${segmentDistance}, fullDistance=${fullDistance}, calculatedPrice=${actualPrice}`);
        }
      }
    }

    const formattedTrain = {
      id: train._id,
      trainNumber: train.trainNumber,
      type: train.type,
      from: actualFrom,
      to: actualTo,
      departureTime: actualDepartureTime,
      arrivalTime: actualArrivalTime,
      price: Math.round(actualPrice * 100) / 100,
      availableSeats: availableSeats,
      stops: train.stops,
      amenities: train.amenities || [],
      wagons: train.wagons || []
    };

    res.json({
      success: true,
      train: formattedTrain
    });
  } catch (error) {
    console.error('Get train error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea trenului'
    });
  }
};


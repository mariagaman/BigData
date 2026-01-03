const Train = require('../models/Train');
const Station = require('../models/Station');

// Search trains
exports.searchTrains = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Te rugăm să specifici stația de plecare și sosire'
      });
    }

    // Găsește stațiile după nume
    const fromStation = await Station.findOne({ name: from });
    const toStation = await Station.findOne({ name: to });

    if (!fromStation || !toStation) {
      return res.status(404).json({
        success: false,
        message: 'Una sau ambele stații nu au fost găsite'
      });
    }

    // Construiește query-ul
    const query = {
      from: fromStation._id,
      to: toStation._id
    };

    // Dacă există dată, filtrează după dată
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.departureTime = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    const trains = await Train.find(query)
      .populate('from', 'name city')
      .populate('to', 'name city')
      .sort({ departureTime: 1 });

    // Transformă rezultatele pentru a fi compatibile cu frontend-ul
    const formattedTrains = trains.map(train => ({
      id: train._id,
      trainNumber: train.trainNumber,
      type: train.type,
      from: train.from.name,
      to: train.to.name,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      price: train.price,
      availableSeats: train.totalSeats,
      stops: train.stops,
      amenities: train.amenities || [],
      wagons: train.wagons || []
    }));

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

// Get train by ID
exports.getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id)
      .populate('from', 'name city')
      .populate('to', 'name city');

    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Tren negăsit'
      });
    }

    const formattedTrain = {
      id: train._id,
      trainNumber: train.trainNumber,
      type: train.type,
      from: train.from.name,
      to: train.to.name,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      price: train.price,
      availableSeats: train.totalSeats,
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


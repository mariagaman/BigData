const Station = require('../models/Station');

exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find().sort({ name: 1 });

    res.json({
      success: true,
      stations
    });
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea stațiilor'
    });
  }
};

exports.getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Stație negăsită'
      });
    }

    res.json({
      success: true,
      station
    });
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea stației'
    });
  }
};


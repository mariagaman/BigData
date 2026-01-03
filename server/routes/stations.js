const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

router.get('/', stationController.getAllStations);
router.get('/:id', stationController.getStationById);

module.exports = router;


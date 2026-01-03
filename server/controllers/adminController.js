const User = require('../models/User');
const Train = require('../models/Train');
const Booking = require('../models/Booking');
const Station = require('../models/Station');

// Obține statistici generale
exports.getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate, status, paymentStatus } = req.query;

    // Construiește query-ul pentru filtrare
    const bookingQuery = {};
    if (startDate || endDate) {
      bookingQuery.bookingDate = {};
      if (startDate) {
        bookingQuery.bookingDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        bookingQuery.bookingDate.$lte = end;
      }
    }
    if (status) {
      bookingQuery.status = status;
    }
    if (paymentStatus) {
      bookingQuery.paymentStatus = paymentStatus;
    }

    // Statistici generale
    const totalUsers = await User.countDocuments();
    const totalTrains = await Train.countDocuments();
    const totalBookings = await Booking.countDocuments(bookingQuery);
    
    // Statistici bookings
    const confirmedBookings = await Booking.countDocuments({ ...bookingQuery, status: 'confirmata' });
    const cancelledBookings = await Booking.countDocuments({ ...bookingQuery, status: 'anulata' });
    
    // Statistici plăți
    const completedPayments = await Booking.countDocuments({ ...bookingQuery, paymentStatus: 'finalizat' });
    const refundedPayments = await Booking.countDocuments({ ...bookingQuery, paymentStatus: 'rambursat' });
    
    // Venituri totale
    const revenueData = await Booking.aggregate([
      { $match: { ...bookingQuery, paymentStatus: 'finalizat', status: 'confirmata' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Bookings pe lună (ultimele 12 luni)
    const monthlyBookings = await Booking.aggregate([
      { $match: bookingQuery },
      {
        $group: {
          _id: {
            year: { $year: '$bookingDate' },
            month: { $month: '$bookingDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Bookings pe status
    const bookingsByStatus = await Booking.aggregate([
      { $match: bookingQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Bookings pe metodă de plată
    const bookingsByPaymentMethod = await Booking.aggregate([
      { $match: bookingQuery },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Top 5 trenuri cele mai căutate
    const topTrains = await Booking.aggregate([
      { $match: { ...bookingQuery, status: 'confirmata' } },
      {
        $group: {
          _id: '$train',
          count: { $sum: 1 },
          totalPassengers: { $sum: { $size: '$passengers' } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Populează detaliile trenurilor
    const topTrainsWithDetails = await Promise.all(
      topTrains.map(async (item) => {
        const train = await Train.findById(item._id).populate('from', 'name').populate('to', 'name');
        return {
          trainNumber: train ? train.trainNumber : 'N/A',
          route: train ? `${train.from.name} - ${train.to.name}` : 'N/A',
          bookings: item.count,
          passengers: item.totalPassengers
        };
      })
    );

    // Utilizatori noi pe lună
    const newUsersByMonth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      stats: {
        overview: {
          totalUsers,
          totalTrains,
          totalBookings,
          confirmedBookings,
          cancelledBookings,
          completedPayments,
          refundedPayments,
          totalRevenue: Math.round(totalRevenue * 100) / 100
        },
        monthlyBookings,
        bookingsByStatus,
        bookingsByPaymentMethod,
        topTrains: topTrainsWithDetails,
        newUsersByMonth
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea statisticilor'
    });
  }
};

// Obține lista de bookings cu filtre
exports.getBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      status, 
      paymentStatus,
      trainId,
      userId
    } = req.query;

    const query = {};
    
    if (startDate || endDate) {
      query.bookingDate = {};
      if (startDate) {
        query.bookingDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.bookingDate.$lte = end;
      }
    }
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (trainId) query.train = trainId;
    if (userId) query.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('train', 'trainNumber type from to')
      .populate('userId', 'email firstName lastName')
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea rezervărilor'
    });
  }
};

// Obține lista de utilizatori
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea utilizatorilor'
    });
  }
};

// Obține lista de trenuri
exports.getTrains = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, search } = req.query;

    const query = {};
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { trainNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trains = await Train.find(query)
      .populate('from', 'name city')
      .populate('to', 'name city')
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Train.countDocuments(query);

    res.json({
      success: true,
      trains,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get trains error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea trenurilor'
    });
  }
};


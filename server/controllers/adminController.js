const User = require('../models/User');
const Train = require('../models/Train');
const Booking = require('../models/Booking');
const Station = require('../models/Station');

exports.getDashboardStats = async (req, res) => {
  try {
    console.log('getDashboardStats - Starting...');
    const { startDate, endDate, status, paymentStatus } = req.query;
    console.log('getDashboardStats - Query params:', { startDate, endDate, status, paymentStatus });

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

    const totalUsers = await User.countDocuments();
    const totalTrains = await Train.countDocuments();
    const totalBookings = await Booking.countDocuments(bookingQuery);

    const confirmedBookings = await Booking.countDocuments({ ...bookingQuery, status: 'confirmata' });
    const cancelledBookings = await Booking.countDocuments({ ...bookingQuery, status: 'anulata' });

    const completedPayments = await Booking.countDocuments({ ...bookingQuery, paymentStatus: 'finalizat' });
    const refundedPayments = await Booking.countDocuments({ ...bookingQuery, paymentStatus: 'rambursat' });

    let revenueData = [];
    let totalRevenue = 0;
    try {
      revenueData = await Booking.aggregate([
        { $match: { ...bookingQuery, paymentStatus: 'finalizat', status: 'confirmata' } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$totalPrice', 0] } } } }
      ]);
      totalRevenue = revenueData.length > 0 ? (revenueData[0].total || 0) : 0;
    } catch (error) {
      console.error('Error in revenueData aggregation:', error);
      totalRevenue = 0;
    }

    let monthlyBookings = [];
    try {
      monthlyBookings = await Booking.aggregate([
        { $match: { ...bookingQuery, bookingDate: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: {
              year: { $year: '$bookingDate' },
              month: { $month: '$bookingDate' }
            },
            count: { $sum: 1 },
            revenue: { $sum: { $ifNull: ['$totalPrice', 0] } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]);
    } catch (error) {
      console.error('Error in monthlyBookings aggregation:', error);
      monthlyBookings = [];
    }

    let bookingsByStatus = [];
    try {
      bookingsByStatus = await Booking.aggregate([
        { $match: { ...bookingQuery, status: { $exists: true } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
    } catch (error) {
      console.error('Error in bookingsByStatus aggregation:', error);
      bookingsByStatus = [];
    }

    let bookingsByPaymentMethod = [];
    try {
      bookingsByPaymentMethod = await Booking.aggregate([
        { $match: { ...bookingQuery, paymentMethod: { $exists: true } } },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            revenue: { $sum: { $ifNull: ['$totalPrice', 0] } }
          }
        }
      ]);
    } catch (error) {
      console.error('Error in bookingsByPaymentMethod aggregation:', error);
      bookingsByPaymentMethod = [];
    }

    let topTrains = [];
    try {
      topTrains = await Booking.aggregate([
        { $match: { ...bookingQuery, train: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$train',
            count: { $sum: 1 },
            totalPassengers: {
              $sum: {
                $ifNull: [
                  { $size: { $ifNull: ['$passengers', []] } },
                  0
                ]
              }
            }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
    } catch (error) {
      console.error('Error in topTrains aggregation:', error);
      topTrains = [];
    }

    const topTrainsWithDetails = await Promise.all(
      topTrains
        .filter(item => item._id)
        .map(async (item) => {
          try {
            const train = await Train.findById(item._id).populate('from', 'name').populate('to', 'name');
            if (!train) {
              return null;
            }
            return {
              trainNumber: train.trainNumber || 'N/A',
              route: train.from && train.to ? `${train.from.name} - ${train.to.name}` : 'N/A',
              bookings: item.count || 0,
              passengers: item.totalPassengers || 0
            };
          } catch (error) {
            console.error('Error populating train:', error);
            return null;
          }
        })
    );

    const filteredTopTrains = topTrainsWithDetails.filter(item => item !== null);

    let newUsersByMonth = [];
    try {
      newUsersByMonth = await User.aggregate([
        { $match: { createdAt: { $exists: true, $ne: null } } },
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
    } catch (error) {
      console.error('Error in newUsersByMonth aggregation:', error);
      newUsersByMonth = [];
    }

    const responseData = {
      success: true,
      stats: {
        overview: {
          totalUsers: totalUsers || 0,
          totalTrains: totalTrains || 0,
          totalBookings: totalBookings || 0,
          confirmedBookings: confirmedBookings || 0,
          cancelledBookings: cancelledBookings || 0,
          completedPayments: completedPayments || 0,
          refundedPayments: refundedPayments || 0,
          totalRevenue: Math.round((totalRevenue || 0) * 100) / 100
        },
        monthlyBookings: monthlyBookings || [],
        bookingsByStatus: bookingsByStatus || [],
        bookingsByPaymentMethod: bookingsByPaymentMethod || [],
        topTrains: filteredTopTrains || [],
        newUsersByMonth: newUsersByMonth || []
      }
    };

    console.log('getDashboardStats - Response data:', {
      totalUsers: responseData.stats.overview.totalUsers,
      totalBookings: responseData.stats.overview.totalBookings,
      monthlyBookingsCount: responseData.stats.monthlyBookings.length,
      bookingsByStatusCount: responseData.stats.bookingsByStatus.length
    });

    res.json(responseData);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea statisticilor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

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


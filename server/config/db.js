const mongoose = require('mongoose');

const connectDB = async () => {
  try {

    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/railmate';

    const conn = await mongoose.connect(mongoURI);

    console.log(`Connected to MongoDB: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.error('Server is running without connection to the database. Make sure MongoDB is running.');

  }
};

module.exports = connectDB;


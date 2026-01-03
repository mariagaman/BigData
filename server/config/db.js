const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Conectare la MongoDB
    // Folosește variabila de mediu MONGODB_URI sau conexiunea locală implicită
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/railmate';
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB conectat: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error('❌ Eroare la conectarea la MongoDB:', error.message);
    console.error('⚠️  Serverul pornește fără conexiune la baza de date. Asigură-te că MongoDB rulează.');
    // Nu oprim serverul, doar afișăm eroarea
    // process.exit(1);
  }
};

module.exports = connectDB;


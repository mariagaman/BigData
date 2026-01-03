# RailMate Server

Backend server pentru aplicația RailMate - sistem de rezervare bilete de tren.

## Tehnologii

- **Node.js** - Runtime environment
- **Express.js** - Framework web
- **MongoDB** - Baza de date NoSQL
- **Mongoose** - ODM pentru MongoDB
- **bcryptjs** - Hash pentru parole
- **jsonwebtoken** - Autentificare JWT

## Instalare

1. Instalează dependențele:
```bash
npm install
```

2. Creează fișierul `.env` (copiază din `.env.example`):
```bash
cp .env.example .env
```

3. Configurează variabilele de mediu în `.env`:
```
MONGODB_URI=mongodb://localhost:27017/railmate
PORT=5000
JWT_SECRET=your-secret-key-here
```

4. Asigură-te că MongoDB rulează pe sistemul tău

5. Pornește serverul:
```bash
# Development (cu nodemon)
npm run dev

# Production
npm start
```

## Structura Proiectului

```
server/
├── config/
│   └── db.js          # Configurare conexiune MongoDB
├── models/
│   ├── User.js        # Model utilizatori
│   ├── Station.js     # Model stații
│   ├── Train.js       # Model trenuri
│   ├── Booking.js     # Model rezervări
│   └── Payment.js      # Model plăți
├── routes/             # Rute API (de adăugat)
├── controllers/        # Controlere (de adăugat)
├── middleware/         # Middleware (de adăugat)
├── server.js           # Punct de intrare server
├── package.json
└── .env                # Variabile de mediu (nu se versionizează)
```

## Modele MongoDB

### Users
- Email, parolă (hash), nume, telefon, rol

### Stations
- Nume, cod, oraș, regiune, coordonate

### Trains
- Număr tren, tip, rută, vagoane cu scaune, stații intermediare

### Bookings
- Rezervări cu pasageri, snapshot tren, status plată

### Payments
- Tranzacții de plată legate de rezervări

## API Endpoints

(De implementat)

## Port

Serverul rulează implicit pe portul **5000**.

Pentru a schimba portul, setează variabila de mediu `PORT` în `.env`.


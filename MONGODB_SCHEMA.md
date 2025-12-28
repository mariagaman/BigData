# Schema MongoDB pentru RailMate

## 1. Colecția: `users`

Documente pentru utilizatori/conturi.

```javascript
{
  _id: ObjectId,
  email: String,              // Unique, required
  password: String,           // Hashed, required
  firstName: String,          // Required
  lastName: String,           // Required
  phone: String,              // Optional
  createdAt: Date,            // Auto-generated
  updatedAt: Date,            // Auto-updated
  role: String                // 'user' | 'admin', Default: 'user'
}
```

**Indexuri:**
- `email`: unique
- `createdAt`: pentru sortare

---

## 2. Colecția: `stations`

Documente pentru stații/orașe disponibile.

```javascript
{
  _id: ObjectId,
  name: String,               // Unique, required (ex: "București Nord")
  code: String,               // Unique, optional (ex: "BUC")
  city: String,                // Required (ex: "București")
  region: String,             // Optional (ex: "București")
  coordinates: {
    latitude: Number,          // Optional
    longitude: Number          // Optional
  },
  createdAt: Date
}
```

**Indexuri:**
- `name`: unique
- `code`: unique (dacă există)
- `city`: pentru căutare

---

## 3. Colecția: `trains`

Documente pentru trenuri și rute.

```javascript
{
  _id: ObjectId,
  trainNumber: String,        // Required (ex: "IR 1621")
  type: String,               // Required: 'InterCity' | 'InterRegio' | 'Regio' | 'Personal'
  from: ObjectId,             // Reference to stations._id
  to: ObjectId,               // Reference to stations._id
  date: Date,
  departureTime: Date,         // Required
  arrivalTime: Date,           // Required
  price: Number,               // Required (preț per persoană în RON)
  totalSeats: Number,          // Required (capacitate totală)
  stops: Number,               // Număr de opriri intermediare
  amenities: [String],         // Array: ['wifi', 'ac', 'food', 'power']
  wagons: [{                   // Array de vagoane
    wagonNumber: Number,        // Required (ex: 1, 2, 3)
    wagonType: String,         // 'first' | 'second' | 'couchette' | 'sleeper'
    totalSeats: Number,        // Required (număr total de scaune în vagon)
    seats: [{                   // Array de scaune
      seatNumber: String,       // Required (ex: "1A", "12B", "25")
      seatType: String          // 'window' | 'aisle' | 'middle' (opțional)
    }],
    amenities: [String]         // Amenități specifice vagonului
  }],
  route: {
    intermediateStations: [{   // Opriri intermediare
      station: ObjectId,       // Reference to stations._id
      arrivalTime: Date,
      departureTime: Date,
      stopDuration: Number,     // Minute
      distanceFromStart: Number // Distanța de la stația de plecare (în km)
    }]
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexuri:**
- `from`, `to`: pentru căutare rute
- `departureTime`: pentru filtrare după dată
- `trainNumber`: pentru căutare
- Compound index: `{from: 1, to: 1, departureTime: 1}`

---

## 4. Colecția: `bookings`

Documente pentru rezervări/bilete.

```javascript
{
  _id: ObjectId,
  bookingNumber: String,      // Unique, auto-generated (ex: "RAILMATE-1234567890")
  userId: ObjectId,           // Reference to users._id, required
  train: ObjectId,            // Reference to trains._id, required
  trainSnapshot: [{            // Snapshot al trenului la momentul rezervării
    trainNumber: String,
    type: String,
    from: String,              // Stația de plecare (poate fi intermediară)
    to: String,                // Stația de sosire (poate fi intermediară)
    departureTime: Date,       // Ora de plecare din stația 'from'
    arrivalTime: Date,         // Ora de sosire în stația 'to'
    price: Number,  
  }],
  passengers: [{              // Array de pasageri
    firstName: String,        // Required
    lastName: String,          // Required
    email: String,            // Required
    phone: String,            // Required
    wagonNumber: Number,      // Required (număr vagon)
    seatNumber: String,       // Required (ex: "1A", "12B")
  }],
  paymentMethod: String,      // 'card' | 'paypal' | 'transfer'
  paymentStatus: String,     // 'pending' | 'completed' | 'failed' | 'refunded'
  totalPrice: Number,         // Required (preț total în RON)
  status: String,             // 'confirmed' | 'cancelled' | 'completed'
  bookingDate: Date,          // Data rezervării
  cancellationDate: Date,     // Optional (dacă e anulată)
  cancellationReason: String, // Optional
  qrCode: String,            // Cod QR generat pentru bilet
  createdAt: Date,
  updatedAt: Date
}
```

**Indexuri:**
- `userId`: pentru găsirea rezervărilor utilizatorului
- `bookingNumber`: unique
- `train`: pentru statistici
- `status`: pentru filtrare
- `bookingDate`: pentru sortare
- Compound index: `{userId: 1, status: 1, bookingDate: -1}`

---

## 5. Colecția: `payments`

Documente pentru tranzacții de plată.

```javascript
{
  _id: ObjectId,
  bookingId: ObjectId,        // Reference to bookings._id
  userId: ObjectId,           // Reference to users._id
  amount: Number,             // Required
  currency: String,           // Default: "RON"
  method: String,             // 'card' | 'paypal' | 'transfer'
  status: String,             // 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId: String,      // ID de la procesatorul de plăți
  paymentDate: Date,
  refundDate: Date,           // Optional
  refundAmount: Number,       // Optional
  createdAt: Date,
  updatedAt: Date
}
```

**Indexuri:**
- `bookingId`: unique
- `userId`: pentru istoric plăți
- `transactionId`: unique (dacă există)
- `status`: pentru filtrare

---

## Relații și Referințe

### Relații principale:
- `bookings.userId` → `users._id`
- `bookings.train` → `trains._id`
- `trains.from` → `stations._id`
- `trains.to` → `stations._id`
- `trains.route.intermediateStations.station` → `stations._id`
- `payments.bookingId` → `bookings._id`
- `payments.userId` → `users._id`

### Embedded Documents:
- `bookings.trainSnapshot` - snapshot pentru istoric (nu se modifică dacă trenul se schimbă)
- `bookings.passengers` - array embedded (nu necesită colecție separată pentru simplu)
- `trains.route.intermediateStations` - embedded în tren

---

## Exemple de Query-uri utile

### Găsire trenuri pentru o rută și dată:
```javascript
db.trains.find({
  from: ObjectId("..."),
  to: ObjectId("..."),
  departureTime: {
    $gte: ISODate("2025-12-27T00:00:00Z"),
    $lt: ISODate("2025-12-28T00:00:00Z")
  }
}).sort({ departureTime: 1 })
```

### Găsire locuri disponibile într-un vagon:
```javascript
db.trains.findOne(
  { _id: ObjectId("...") },
  { 
    "wagons": {
      $elemMatch: { wagonNumber: 1 }
    }
  }
)
```

### Verificare disponibilitate scaun (verificând dacă nu e rezervat):
```javascript
// Verifică dacă scaunul nu este deja rezervat în bookings
db.bookings.find({
  train: ObjectId("..."),
  status: { $ne: "cancelled" },
  "passengers.seatNumber": "12A",
  "passengers.wagonNumber": 1
})
```

### Rezervările unui utilizator:
```javascript
db.bookings.find({
  userId: ObjectId("..."),
  status: { $ne: "cancelled" }
}).sort({ bookingDate: -1 })
```

### Statistici rezervări:
```javascript
db.bookings.aggregate([
  { $match: { status: "confirmed" } },
  { $group: {
    _id: "$train",
    totalBookings: { $sum: 1 },
    totalRevenue: { $sum: "$totalPrice" }
  }}
])
```

---

## Note importante:

1. **Validare**: Folosește Mongoose schemas cu validare pentru a asigura integritatea datelor
2. **Indexuri**: Creează indexuri pentru câmpurile folosite frecvent în query-uri
3. **Vagoane și Scaune**: Fiecare tren are o structură detaliată de vagoane cu scaune numerotate pentru gestionarea locurilor
4. **Snapshots**: Păstrează snapshot-uri în bookings pentru a nu pierde date istorice
5. **Securitate**: Nu stoca parole în plain text - folosește bcrypt sau similar
6. **Timestamps**: Folosește `createdAt` și `updatedAt` pentru audit
7. **Rezervare Scaune**: Disponibilitatea scaunelor se verifică prin interogarea colecției `bookings` pentru a vedea ce scaune sunt deja rezervate
8. **Plăți**: Informațiile despre plată pot fi stocate atât în `bookings` (paymentMethod, paymentStatus) cât și în colecția separată `payments` pentru detalii suplimentare și istoric


// Mock API service - va fi înlocuit cu apeluri reale către backend

const mockTrains = [
  {
    id: 1,
    trainNumber: 'IR 1621',
    type: 'InterRegio',
    from: 'București Nord',
    to: 'Brașov',
    departureTime: new Date('2025-10-15T08:00:00'),
    arrivalTime: new Date('2025-10-15T10:45:00'),
    price: 45,
    availableSeats: 120,
    stops: 3,
    amenities: ['wifi', 'ac', 'power']
  },
  {
    id: 2,
    trainNumber: 'IC 581',
    type: 'InterCity',
    from: 'București Nord',
    to: 'Brașov',
    departureTime: new Date('2025-10-15T10:30:00'),
    arrivalTime: new Date('2025-10-15T13:00:00'),
    price: 65,
    availableSeats: 80,
    stops: 1,
    amenities: ['wifi', 'ac', 'food', 'power']
  },
  {
    id: 3,
    trainNumber: 'R 3045',
    type: 'Regio',
    from: 'București Nord',
    to: 'Brașov',
    departureTime: new Date('2025-10-15T14:15:00'),
    arrivalTime: new Date('2025-10-15T18:30:00'),
    price: 35,
    availableSeats: 150,
    stops: 8,
    amenities: ['ac']
  },
  {
    id: 4,
    trainNumber: 'IC 521',
    type: 'InterCity',
    from: 'Cluj-Napoca',
    to: 'Timișoara Nord',
    departureTime: new Date('2025-10-15T07:00:00'),
    arrivalTime: new Date('2025-10-15T10:30:00'),
    price: 60,
    availableSeats: 90,
    stops: 2,
    amenities: ['wifi', 'ac', 'food', 'power']
  },
  {
    id: 5,
    trainNumber: 'IR 1825',
    type: 'InterRegio',
    from: 'București Nord',
    to: 'Constanța',
    departureTime: new Date('2025-10-15T09:00:00'),
    arrivalTime: new Date('2025-10-15T11:30:00'),
    price: 55,
    availableSeats: 100,
    stops: 4,
    amenities: ['wifi', 'ac', 'power']
  },
  {
    id: 6,
    trainNumber: 'IC 585',
    type: 'InterCity',
    from: 'Iași',
    to: 'București Nord',
    departureTime: new Date('2025-10-15T06:30:00'),
    arrivalTime: new Date('2025-10-15T13:00:00'),
    price: 75,
    availableSeats: 85,
    stops: 3,
    amenities: ['wifi', 'ac', 'food', 'power']
  }
];

// Simulează întârziere de rețea
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const searchTrains = async (searchParams) => {
  await delay(1000);
  
  // Filtrează trenurile în funcție de parametrii de căutare
  const results = mockTrains.filter(train => {
    const matchesRoute = train.from === searchParams.from && train.to === searchParams.to;
    
    // Pentru demonstrație, setăm data din searchParams la trenuri
    if (matchesRoute && searchParams.date) {
      const searchDate = new Date(searchParams.date);
      train.departureTime = new Date(searchDate);
      train.departureTime.setHours(train.departureTime.getHours() + train.id);
      
      train.arrivalTime = new Date(train.departureTime);
      const duration = mockTrains.find(t => t.id === train.id).arrivalTime - 
                      mockTrains.find(t => t.id === train.id).departureTime;
      train.arrivalTime.setTime(train.arrivalTime.getTime() + duration);
    }
    
    return matchesRoute;
  });

  return results;
};

export const getTrainById = async (trainId) => {
  await delay(500);
  
  const train = mockTrains.find(t => t.id === parseInt(trainId));
  
  if (!train) {
    throw new Error('Train not found');
  }
  
  return { ...train };
};

export const createBooking = async (bookingData) => {
  await delay(1000);
  
  // Simulează crearea unei rezervări
  return {
    success: true,
    bookingId: Date.now(),
    message: 'Rezervare creată cu succes'
  };
};

export const getUserBookings = async (userId) => {
  await delay(800);
  
  // Returnează rezervările utilizatorului
  return [];
};

export const cancelBooking = async (bookingId) => {
  await delay(500);
  
  return {
    success: true,
    message: 'Rezervare anulată cu succes'
  };
};


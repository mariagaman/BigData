import API_BASE_URL from '../config/api';

// Helper function pentru request-uri
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Eroare la request');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Stations API
export const getAllStations = async () => {
  const response = await apiRequest('/stations');
  return response.stations;
};

// Trains API
export const searchTrains = async (searchParams) => {
  const queryParams = new URLSearchParams({
    from: searchParams.from,
    to: searchParams.to,
    ...(searchParams.date && { date: searchParams.date })
  });

  const response = await apiRequest(`/trains/search?${queryParams}`);
  
  // Transformă datele pentru compatibilitate cu frontend
  return response.trains.map(train => ({
    ...train,
    departureTime: new Date(train.departureTime),
    arrivalTime: new Date(train.arrivalTime)
  }));
};

export const getTrainById = async (trainId, from = null, to = null) => {
  // Dacă există from și to, le trimite ca query params pentru calcularea corectă a prețului
  let url = `/trains/${trainId}`;
  if (from && to) {
    url += `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  }
  const response = await apiRequest(url);
  
  // Transformă datele pentru compatibilitate cu frontend
  return {
    ...response.train,
    departureTime: new Date(response.train.departureTime),
    arrivalTime: new Date(response.train.arrivalTime)
  };
};

// Bookings API
export const createBooking = async (bookingData) => {
  const response = await apiRequest('/bookings', {
    method: 'POST',
    body: bookingData
  });
  return response.booking;
};

export const getUserBookings = async () => {
  const response = await apiRequest('/bookings/user');
  return response.bookings.map(booking => ({
    ...booking,
    train: {
      ...booking.train,
      departureTime: new Date(booking.train.departureTime),
      arrivalTime: new Date(booking.train.arrivalTime)
    },
    bookingDate: new Date(booking.bookingDate)
  }));
};

export const getBookingById = async (bookingId) => {
  const response = await apiRequest(`/bookings/${bookingId}`);
  return {
    ...response.booking,
    train: {
      ...response.booking.train,
      departureTime: new Date(response.booking.train.departureTime),
      arrivalTime: new Date(response.booking.train.arrivalTime)
    },
    bookingDate: new Date(response.booking.bookingDate)
  };
};

export const cancelBooking = async (bookingId) => {
  const response = await apiRequest(`/bookings/${bookingId}/cancel`, {
    method: 'PUT'
  });
  return response;
};

// Payments API
export const createPayment = async (paymentData) => {
  const response = await apiRequest('/payments', {
    method: 'POST',
    body: paymentData
  });
  return response.payment;
};

export const getPaymentByBookingId = async (bookingId) => {
  const response = await apiRequest(`/payments/booking/${bookingId}`);
  return response.payment;
};

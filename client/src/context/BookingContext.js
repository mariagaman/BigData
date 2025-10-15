import React, { createContext, useState, useContext } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1
  });

  const [selectedTrain, setSelectedTrain] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  const updateSearchParams = (params) => {
    setSearchParams({ ...searchParams, ...params });
  };

  const selectTrain = (train) => {
    setSelectedTrain(train);
  };

  const createBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: Date.now(),
      bookingDate: new Date().toISOString()
    };
    setBookingData(newBooking);
    setUserBookings([...userBookings, newBooking]);
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setUserBookings(userBookings.filter(b => b.id !== bookingId));
  };

  const value = {
    searchParams,
    updateSearchParams,
    selectedTrain,
    selectTrain,
    bookingData,
    createBooking,
    userBookings,
    cancelBooking
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};


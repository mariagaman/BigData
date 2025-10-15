import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { searchTrains } from '../services/api';
import SearchForm from '../components/SearchForm';
import TrainCard from '../components/TrainCard';
import '../styles/SearchResults.css';

const SearchResults = () => {
  const { searchParams, selectTrain } = useBooking();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('time');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      try {
        const results = await searchTrains(searchParams);
        setTrains(results);
      } catch (error) {
        console.error('Error fetching trains:', error);
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.from && searchParams.to && searchParams.date) {
      fetchTrains();
    }
  }, [searchParams]);

  const filteredTrains = trains.filter(train => {
    if (filterType === 'all') return true;
    return train.type === filterType;
  });

  const sortedTrains = [...filteredTrains].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return new Date(a.departureTime) - new Date(b.departureTime);
      case 'price':
        return a.price - b.price;
      case 'duration':
        const durationA = new Date(a.arrivalTime) - new Date(a.departureTime);
        const durationB = new Date(b.arrivalTime) - new Date(b.departureTime);
        return durationA - durationB;
      default:
        return 0;
    }
  });

  if (!searchParams.from || !searchParams.to || !searchParams.date) {
    return (
      <div className="search-results">
        <div className="no-search">
          <h2>Începe căutarea</h2>
          <p>Te rugăm să completezi formularul de căutare pentru a găsi trenuri disponibile.</p>
          <SearchForm />
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-header">
        <div className="search-info">
          <h1>
            {searchParams.from} → {searchParams.to}
          </h1>
          <p>
            {new Date(searchParams.date).toLocaleDateString('ro-RO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            {' • '}
            {searchParams.passengers} {searchParams.passengers === 1 ? 'pasager' : 'pasageri'}
          </p>
        </div>
        <SearchForm inline={true} />
      </div>

      <div className="results-container">
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3>Sortează după</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="sort"
                  value="time"
                  checked={sortBy === 'time'}
                  onChange={(e) => setSortBy(e.target.value)}
                />
                <span>Oră plecare</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="sort"
                  value="price"
                  checked={sortBy === 'price'}
                  onChange={(e) => setSortBy(e.target.value)}
                />
                <span>Preț</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="sort"
                  value="duration"
                  checked={sortBy === 'duration'}
                  onChange={(e) => setSortBy(e.target.value)}
                />
                <span>Durată</span>
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Tip tren</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="type"
                  value="all"
                  checked={filterType === 'all'}
                  onChange={(e) => setFilterType(e.target.value)}
                />
                <span>Toate</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="type"
                  value="InterCity"
                  checked={filterType === 'InterCity'}
                  onChange={(e) => setFilterType(e.target.value)}
                />
                <span>InterCity</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="type"
                  value="InterRegio"
                  checked={filterType === 'InterRegio'}
                  onChange={(e) => setFilterType(e.target.value)}
                />
                <span>InterRegio</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="type"
                  value="Regio"
                  checked={filterType === 'Regio'}
                  onChange={(e) => setFilterType(e.target.value)}
                />
                <span>Regio</span>
              </label>
            </div>
          </div>
        </aside>

        <div className="results-list">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Căutăm cele mai bune trenuri pentru tine...</p>
            </div>
          ) : sortedTrains.length > 0 ? (
            <>
              <div className="results-count">
                Găsite {sortedTrains.length} {sortedTrains.length === 1 ? 'tren' : 'trenuri'}
              </div>
              {sortedTrains.map((train) => (
                <TrainCard 
                  key={train.id} 
                  train={train}
                />
              ))}
            </>
          ) : (
            <div className="no-results">
              <h2>Nu am găsit trenuri disponibile</h2>
              <p>Te rugăm să încerci o altă dată sau rută.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { getAllStations } from '../services/api';
import DatePicker from './DatePicker';
import '../styles/SearchForm.css';

const SearchForm = ({ inline = false }) => {
  const navigate = useNavigate();
  const { searchParams, updateSearchParams } = useBooking();

  const [formData, setFormData] = useState({
    from: searchParams.from || '',
    to: searchParams.to || '',
    date: searchParams.date || '',
    passengers: searchParams.passengers || 1
  });

  const [errors, setErrors] = useState({});
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsData = await getAllStations();
        setStations(stationsData);
      } catch (error) {
        console.error('Error fetching stations:', error);

        setStations([
          { name: 'București Nord' },
          { name: 'Cluj-Napoca' },
          { name: 'Timișoara Nord' },
          { name: 'Iași' },
          { name: 'Constanța' },
          { name: 'Brașov' },
          { name: 'Craiova' },
          { name: 'Galați' },
          { name: 'Ploiești Sud' },
          { name: 'Oradea' },
          { name: 'Sibiu' },
          { name: 'Arad' },
          { name: 'Pitești' },
          { name: 'Bacău' },
          { name: 'Suceava' }
        ]);
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (searchParams.from || searchParams.to || searchParams.date) {
      setFormData({
        from: searchParams.from || '',
        to: searchParams.to || '',
        date: searchParams.date || '',
        passengers: searchParams.passengers || 1
      });
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.from) newErrors.from = 'Selectează orașul de plecare';
    if (!formData.to) newErrors.to = 'Selectează orașul de sosire';
    if (formData.from === formData.to) {
      newErrors.to = 'Destinația trebuie să fie diferită de plecare';
    }
    if (!formData.date) newErrors.date = 'Selectează data călătoriei';
    if (formData.passengers < 1) newErrors.passengers = 'Minim 1 pasager';

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      newErrors.date = 'Data nu poate fi în trecut';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length === 0) {
      updateSearchParams(formData);
      navigate('/search');
    } else {
      setErrors(newErrors);
    }
  };

  const swapCities = () => {
    setFormData({
      ...formData,
      from: formData.to,
      to: formData.from
    });
  };

  return (
    <form className={`search-form ${inline ? 'inline' : ''}`} onSubmit={handleSubmit}>
      <div className="form-row-top">
        <div className="form-group">
          <div className="labels-row">
            <label htmlFor="from">Plecare din</label>
            <label htmlFor="to">Sosire în</label>
          </div>
          <div className="inputs-row">
            <select
              id="from"
              name="from"
              value={formData.from}
              onChange={handleChange}
              className={errors.from ? 'error' : ''}
            >
              <option value="">Selectează orașul</option>
              {stations.map(station => (
                <option key={station._id || station.name} value={station.name}>{station.name}</option>
              ))}
            </select>

            <button
              type="button"
              className="swap-button"
              onClick={swapCities}
              title="Inversează orașele"
            >
              ⇄
            </button>

            <select
              id="to"
              name="to"
              value={formData.to}
              onChange={handleChange}
              className={errors.to ? 'error' : ''}
            >
              <option value="">Selectează orașul</option>
              {stations.map(station => (
                <option key={station._id || station.name} value={station.name}>{station.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Data călătoriei</label>
          <DatePicker
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={errors.date ? 'error' : ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="passengers">Număr pasageri</label>
          <div className="number-input-wrapper">
            <input
              type="number"
              id="passengers"
              name="passengers"
              value={formData.passengers}
              onChange={handleChange}
              min="1"
              max="10"
              className={errors.passengers ? 'error' : ''}
              readOnly
            />
            <div className="number-controls">
              <button
                type="button"
                className="number-btn number-up"
                onClick={() => {
                  if (formData.passengers < 10) {
                    handleChange({ target: { name: 'passengers', value: formData.passengers + 1 } });
                  }
                }}
              >
                ▲
              </button>
              <button
                type="button"
                className="number-btn number-down"
                onClick={() => {
                  if (formData.passengers > 1) {
                    handleChange({ target: { name: 'passengers', value: formData.passengers - 1 } });
                  }
                }}
              >
                ▼
              </button>
            </div>
          </div>
          {errors.passengers && <span className="error-message">{errors.passengers}</span>}
        </div>
      </div>

      <button type="submit" className="search-button">
        🔍 Caută Trenuri
      </button>
    </form>
  );
};

export default SearchForm;


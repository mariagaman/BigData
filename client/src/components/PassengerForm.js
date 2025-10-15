import React, { useState } from 'react';
import '../styles/PassengerForm.css';

const PassengerForm = ({ passengerIndex, onUpdate }) => {
  const [passenger, setPassenger] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedPassenger = { ...passenger, [name]: value };
    setPassenger(updatedPassenger);
    onUpdate(passengerIndex, updatedPassenger);
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Email invalid';
      case 'phone':
        return /^[0-9]{10}$/.test(value) ? '' : 'Număr de telefon invalid (10 cifre)';
      case 'idNumber':
        return value.length >= 6 ? '' : 'CNP/CI invalid';
      default:
        return value.trim() ? '' : 'Câmp obligatoriu';
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors({ ...errors, [name]: error });
    }
  };

  return (
    <div className="passenger-form">
      <h4>Pasagerul {passengerIndex + 1}</h4>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`firstName-${passengerIndex}`}>Prenume *</label>
          <input
            type="text"
            id={`firstName-${passengerIndex}`}
            name="firstName"
            value={passenger.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.firstName ? 'error' : ''}
            required
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor={`lastName-${passengerIndex}`}>Nume *</label>
          <input
            type="text"
            id={`lastName-${passengerIndex}`}
            name="lastName"
            value={passenger.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.lastName ? 'error' : ''}
            required
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`email-${passengerIndex}`}>Email *</label>
          <input
            type="email"
            id={`email-${passengerIndex}`}
            name="email"
            value={passenger.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.email ? 'error' : ''}
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor={`phone-${passengerIndex}`}>Telefon *</label>
          <input
            type="tel"
            id={`phone-${passengerIndex}`}
            name="phone"
            value={passenger.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.phone ? 'error' : ''}
            placeholder="07XXXXXXXX"
            required
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={`idNumber-${passengerIndex}`}>CNP / Serie CI *</label>
        <input
          type="text"
          id={`idNumber-${passengerIndex}`}
          name="idNumber"
          value={passenger.idNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.idNumber ? 'error' : ''}
          required
        />
        {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}
      </div>
    </div>
  );
};

export default PassengerForm;


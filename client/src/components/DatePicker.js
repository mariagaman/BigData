import React, { useState, useRef, useEffect } from 'react';
import '../styles/DatePicker.css';

const DatePicker = ({ value, onChange, min, className, id, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Inițializăm selectedDate corect pentru a evita problemele cu timezone
  const getInitialDate = () => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  
  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const calendarRef = useRef(null);

  const months = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];

  const weekDays = ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      // Parsează data din format YYYY-MM-DD și o creează în timezone-ul local
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      date.setHours(0, 0, 0, 0);
      setSelectedDate(date);
      setCurrentMonth(date);
    }
  }, [value]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Zile din luna precedentă
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      days.push({
        day: prevMonthLastDay - startingDayOfWeek + i + 1,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - startingDayOfWeek + i + 1)
      });
    }

    // Zile din luna curentă
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day)
      });
    }

    // Zile din luna următoare
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day)
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (date) => {
    // Setăm ora la 0 în timezone-ul local pentru a evita problemele cu timezone
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    
    if (min) {
      const minDate = new Date(min);
      minDate.setHours(0, 0, 0, 0);
      
      if (localDate < minDate) {
        return;
      }
    }

    setSelectedDate(localDate);
    // Formatăm data manual pentru a evita problemele cu timezone-ul UTC
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    onChange({ target: { name, value: formattedDate } });
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    handleDateSelect(today);
    setCurrentMonth(today);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange({ target: { name, value: '' } });
    setIsOpen(false);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date) => {
    if (!min) return false;
    const minDate = new Date(min);
    minDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < minDate;
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return 'Selectează data';
    return selectedDate.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`date-picker ${className || ''}`} ref={calendarRef}>
      <div className="date-picker-input" onClick={() => setIsOpen(!isOpen)}>
        <span className={selectedDate ? 'has-value' : 'placeholder'}>
          {formatDisplayDate()}
        </span>
        <svg className="calendar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {isOpen && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button type="button" className="nav-button" onClick={handlePrevMonth}>
              ‹
            </button>
            <div className="current-month">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button type="button" className="nav-button" onClick={handleNextMonth}>
              ›
            </button>
          </div>

          <div className="calendar-grid">
            <div className="weekdays">
              {weekDays.map((day) => (
                <div key={day} className="weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="days-grid">
              {days.map((dayObj, index) => (
                <button
                  key={index}
                  type="button"
                  className={`day-cell ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${
                    isToday(dayObj.date) ? 'today' : ''
                  } ${isSelected(dayObj.date) ? 'selected' : ''} ${
                    isPastDate(dayObj.date) ? 'disabled' : ''
                  }`}
                  onClick={() => dayObj.isCurrentMonth && !isPastDate(dayObj.date) && handleDateSelect(dayObj.date)}
                  disabled={isPastDate(dayObj.date)}
                >
                  {dayObj.day}
                </button>
              ))}
            </div>
          </div>

          <div className="calendar-footer">
            <button type="button" className="footer-button clear" onClick={handleClear}>
              Șterge
            </button>
            <button type="button" className="footer-button today" onClick={handleToday}>
              Astăzi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;


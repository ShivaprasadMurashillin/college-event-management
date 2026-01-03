import { useState, useEffect } from 'react';
import api from '../../services/api';

const VenueCalendar = ({ venueId, onSelectSlot }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({ calendar: {}, bookings: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (venueId) {
      fetchCalendar();
    }
  }, [venueId, currentDate]);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/venues/${venueId}/calendar`, {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }
      });
      if (response.data.success) {
        setCalendarData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
    setSelectedDate(null);
  };

  const formatDateKey = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getDateStatus = (day) => {
    const dateKey = formatDateKey(day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (checkDate < today) return 'past';
    
    const bookings = calendarData.calendar[dateKey];
    if (bookings && bookings.length > 0) {
      // Check if fully booked (simplified - assumes 9am-6pm slots)
      if (bookings.length >= 3) return 'booked';
      return 'partial';
    }
    return 'available';
  };

  const handleDateClick = (day) => {
    const status = getDateStatus(day);
    if (status === 'past') return;
    
    const dateKey = formatDateKey(day);
    setSelectedDate(dateKey);
    
    if (onSelectSlot) {
      onSelectSlot({
        date: dateKey,
        bookings: calendarData.calendar[dateKey] || []
      });
    }
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'past':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed';
      case 'booked':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'partial':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'available':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 cursor-pointer';
      default:
        return 'bg-white dark:bg-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-48"></div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {[...Array(startingDay)].map((_, i) => (
          <div key={`empty-${i}`} className="h-12"></div>
        ))}

        {/* Days of the month */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateKey = formatDateKey(day);
          const status = getDateStatus(day);
          const isSelected = selectedDate === dateKey;
          const bookings = calendarData.calendar[dateKey] || [];

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={status === 'past'}
              className={`h-12 rounded-lg flex flex-col items-center justify-center relative transition-colors ${
                getStatusStyle(status)
              } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            >
              <span className="text-sm font-medium">{day}</span>
              {bookings.length > 0 && (
                <span className="text-xs">{bookings.length} slot{bookings.length > 1 ? 's' : ''}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/20"></span>
          <span className="text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30"></span>
          <span className="text-gray-600 dark:text-gray-400">Partial</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30"></span>
          <span className="text-gray-600 dark:text-gray-400">Fully Booked</span>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Bookings on {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', month: 'long', day: 'numeric' 
            })}
          </h4>
          {(calendarData.calendar[selectedDate] || []).length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No bookings. This day is fully available!</p>
          ) : (
            <div className="space-y-2">
              {calendarData.calendar[selectedDate].map((booking, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.event_title || 'Reserved'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.start_time} - {booking.end_time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueCalendar;

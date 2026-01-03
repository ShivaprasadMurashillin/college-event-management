import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const RecommendedEvents = ({ personalized = false }) => {
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('foryou');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const [forYouRes, trendingRes] = await Promise.all([
        api.get('/recommendations/for-you?limit=8'),
        api.get('/recommendations/trending?limit=6')
      ]);

      setEvents(forYouRes.data.data || []);
      setTrending(trendingRes.data.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async (eventId) => {
    try {
      await api.post('/recommendations/track-click', {
        event_id: eventId,
        session_id: sessionStorage.getItem('sessionId') || Math.random().toString(36).substr(2, 9)
      });
    } catch (error) {
      // Silently fail
    }
  };

  const EventCard = ({ event }) => {
    // Construct proper image URL
    const getImageUrl = () => {
      if (event.banner_url) {
        return event.banner_url.startsWith('http') 
          ? event.banner_url 
          : `http://localhost:5000${event.banner_url}`;
      }
      if (event.image_url) {
        return event.image_url.startsWith('http')
          ? event.image_url
          : `http://localhost:5000${event.image_url}`;
      }
      // Fallback gradient placeholder
      return null;
    };
    
    const imageUrl = getImageUrl();
    
    return (
    <Link
      to={`/events/${event.id}`}
      onClick={() => trackClick(event.id)}
      className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="aspect-video relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}
        >
          <span className="text-white text-4xl">🎉</span>
        </div>
        {event.is_featured && (
          <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            ⭐ Featured
          </span>
        )}
        <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {event.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
          {event.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(event.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        {event.registrations_count !== undefined && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {event.registrations_count} registered
          </div>
        )}
      </div>
    </Link>
  );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-b-xl">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayEvents = activeTab === 'foryou' ? events : trending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('foryou')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'foryou'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ✨ For You
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'trending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🔥 Trending
          </button>
        </div>
        <Link
          to="/events"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          View all →
        </Link>
      </div>

      {displayEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <span className="text-5xl mb-4 block">📅</span>
          <p>No events available right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedEvents;

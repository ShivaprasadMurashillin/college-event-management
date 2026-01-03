import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react'
import axios from 'axios'
import API_URL from '../config/api'

const Events = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: 'published'
  })

  useEffect(() => {
    fetchEvents()
  }, [filters])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.status) params.append('status', filters.status)

      const response = await axios.get(`${API_URL}/events?${params.toString()}`)
      
      if (response.data.success) {
        setEvents(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchEvents()
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (event) => {
    const eventDate = new Date(event.date)
    const today = new Date()
    
    if (eventDate < today) {
      return <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Past</span>
    }
    
    if (event.max_participants && event.registrations_count >= event.max_participants) {
      return <span className="px-2 py-1 bg-red-200 text-red-700 text-xs rounded-full">Full</span>
    }
    
    return <span className="px-2 py-1 bg-green-200 text-green-700 text-xs rounded-full">Open</span>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-heading mb-4">Upcoming Events</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and register for exciting college events
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Categories</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="competition">Competition</option>
            <option value="other">Other</option>
          </select>

          <button type="submit" className="btn-primary">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </form>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
            >
              {/* Event Banner */}
              {event.banner_url ? (
                <img
                  src={`http://localhost:5000${event.banner_url}`}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-white opacity-50" />
                </div>
              )}

              {/* Event Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                    {event.category}
                  </span>
                  {getStatusBadge(event)}
                </div>

                <h3 className="text-xl font-bold mb-2 line-clamp-2">{event.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{event.venue}</span>
                  </div>

                  {event.max_participants > 0 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>
                        {event.registrations_count} / {event.max_participants} registered
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {event.registration_fee > 0 ? `₹${event.registration_fee}` : 'Free'}
                  </span>
                  <button className="text-primary hover:text-primary/80 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Events

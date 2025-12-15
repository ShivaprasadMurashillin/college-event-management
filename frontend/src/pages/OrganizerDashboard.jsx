import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Plus, Edit, Trash2, Image } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const OrganizerDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, registrations: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
    fetchStats()
  }, [])

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/organizer/events`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setEvents(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/organizer/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/organizer/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        toast.success('Event deleted successfully!')
        fetchEvents()
        fetchStats()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event')
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Organizer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.name || 'Organizer'}!
          </p>
        </div>
        <button
          onClick={() => navigate('/organizer/events/new')}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Events</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <Calendar className="w-12 h-12 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Upcoming</p>
              <p className="text-3xl font-bold mt-2">{stats.upcoming}</p>
            </div>
            <Calendar className="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Past Events</p>
              <p className="text-3xl font-bold mt-2">{stats.past}</p>
            </div>
            <Calendar className="w-12 h-12 text-gray-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Registrations</p>
              <p className="text-3xl font-bold mt-2">{stats.registrations}</p>
            </div>
            <Users className="w-12 h-12 text-accent opacity-50" />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Your Events</h2>
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No events yet
            </p>
            <button
              onClick={() => navigate('/organizer/events/new')}
              className="btn-primary"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
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
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {formatDate(event.date)} at {formatTime(event.date)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {event.registrations_count} / {event.max_participants || '∞'} registered
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                      className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/organizer/events/${event.id}/media`)}
                      className="flex-1 px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 flex items-center justify-center gap-2"
                    >
                      <Image className="w-4 h-4" />
                      Media
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrganizerDashboard

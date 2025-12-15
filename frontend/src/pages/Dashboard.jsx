import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past

  useEffect(() => {
    if (user) {
      fetchRegistrations()
    }
  }, [user])

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/registrations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setRegistrations(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'upcoming') {
      return new Date(reg.date) >= new Date()
    }
    if (filter === 'past') {
      return new Date(reg.date) < new Date()
    }
    return true
  })

  const upcomingCount = registrations.filter(reg => new Date(reg.date) >= new Date()).length
  const pastCount = registrations.filter(reg => new Date(reg.date) < new Date()).length

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">My Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Total Events</p>
          <p className="text-3xl font-bold">{registrations.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Upcoming</p>
          <p className="text-3xl font-bold text-green-500">{upcomingCount}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Attended</p>
          <p className="text-3xl font-bold text-gray-500">{pastCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex gap-4 border-b dark:border-gray-700 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-4 font-medium transition ${
              filter === 'all'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary'
            }`}
          >
            All Events ({registrations.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`pb-3 px-4 font-medium transition ${
              filter === 'upcoming'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`pb-3 px-4 font-medium transition ${
              filter === 'past'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary'
            }`}
          >
            Past Events ({pastCount})
          </button>
        </div>

        {/* Registrations List */}
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No {filter !== 'all' ? filter : ''} events found
            </p>
            <button
              onClick={() => navigate('/events')}
              className="btn-primary"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((reg) => (
              <div
                key={reg.id}
                onClick={() => navigate(`/events/${reg.event_id}`)}
                className="flex items-start gap-4 p-4 border dark:border-gray-700 rounded-lg hover:shadow-lg transition cursor-pointer"
              >
                {reg.banner_url ? (
                  <img
                    src={`http://localhost:5000${reg.banner_url}`}
                    alt={reg.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-8 h-8 text-white opacity-50" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-lg">{reg.title}</h3>
                    {getStatusBadge(reg.status)}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(reg.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{reg.venue}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(reg.status)}
                      <span className="text-xs">
                        Registered on {formatDate(reg.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                    {reg.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

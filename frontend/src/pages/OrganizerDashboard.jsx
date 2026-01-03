import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Plus, Edit, Trash2, Image, UserCheck, X, Mail, Phone } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import API_URL from '../config/api'

const OrganizerDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, registrations: 0 })
  const [loading, setLoading] = useState(true)
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)

  useEffect(() => {
    fetchEvents()
    fetchStats()

    // Add visibility change listener to refetch when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchEvents()
        fetchStats()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Also refetch when window gains focus
    const handleFocus = () => {
      fetchEvents()
      fetchStats()
    }
    
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
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

  const handleViewRegistrations = async (event) => {
    setSelectedEvent(event)
    setShowRegistrationsModal(true)
    setLoadingRegistrations(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/organizer/events/${event.id}/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setRegistrations(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      toast.error('Failed to load registrations')
    } finally {
      setLoadingRegistrations(false)
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
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                        className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/organizer/events/${event.id}/media`)}
                        className="flex-1 px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 flex items-center justify-center gap-2 text-sm"
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
                    <button
                      onClick={() => handleViewRegistrations(event)}
                      className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 text-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      View Registrations ({event.registrations_count})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registrations Modal */}
      {showRegistrationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Event Registrations</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedEvent?.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowRegistrationsModal(false)
                  setSelectedEvent(null)
                  setRegistrations([])
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {loadingRegistrations ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-xl text-gray-600 dark:text-gray-400">No registrations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Total Registrations: <span className="font-bold text-primary">{registrations.length}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold">#</th>
                          <th className="text-left py-3 px-4 font-semibold">Name</th>
                          <th className="text-left py-3 px-4 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 font-semibold">Phone</th>
                          <th className="text-left py-3 px-4 font-semibold">Status</th>
                          <th className="text-left py-3 px-4 font-semibold">Registered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((reg, index) => (
                          <tr key={reg.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-3 px-4">{index + 1}</td>
                            <td className="py-3 px-4 font-medium">{reg.user_name}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <a href={`mailto:${reg.user_email}`} className="text-primary hover:underline">
                                  {reg.user_email}
                                </a>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {reg.user_phone ? (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  {reg.user_phone}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                reg.status === 'registered' || reg.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : reg.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {reg.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {new Date(reg.registered_at || reg.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrganizerDashboard

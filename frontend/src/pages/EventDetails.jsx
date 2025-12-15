import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, DollarSign, ExternalLink, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    fetchEventDetails()
    fetchEventMedia()
    if (user) checkRegistrationStatus()
  }, [id, user])

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/events/${id}`)
      if (response.data.success) {
        setEvent(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const fetchEventMedia = async () => {
    try {
      const response = await axios.get(`${API_URL}/events/${id}/media`)
      if (response.data.success) {
        setMedia(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    }
  }

  const checkRegistrationStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/events/${id}/registration-status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setIsRegistered(response.data.isRegistered)
      }
    } catch (error) {
      console.error('Error checking registration:', error)
    }
  }

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register for events')
      navigate('/login')
      return
    }

    if (event.is_external_registration) {
      window.open(event.external_registration_link, '_blank')
      return
    }

    setRegistering(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/registrations`,
        { event_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        toast.success('Successfully registered for the event!')
        setIsRegistered(true)
        fetchEventDetails()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">Event not found</p>
        <button onClick={() => navigate('/events')} className="btn-primary mt-4">
          Browse Events
        </button>
      </div>
    )
  }

  const eventDate = new Date(event.date)
  const isPastEvent = eventDate < new Date()
  const isFull = event.max_participants && event.registrations_count >= event.max_participants
  const canRegister = !isPastEvent && !isFull && !isRegistered

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
        </button>
      </div>

      {/* Event Banner */}
      <div className="w-full h-96 relative">
        {event.banner_url ? (
          <img
            src={`http://localhost:5000${event.banner_url}`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Calendar className="w-24 h-24 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm capitalize">
              {event.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Event Gallery */}
            {media.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6" />
                  Event Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {media.map((item) => (
                    <img
                      key={item.id}
                      src={`http://localhost:5000${item.file_url}`}
                      alt={item.file_name || 'Event image'}
                      className="w-full h-48 object-cover rounded-lg hover:scale-105 transition cursor-pointer"
                      onClick={() => window.open(`http://localhost:5000${item.file_url}`, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Event Details</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(event.date)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTime(event.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.venue}</p>
                  </div>
                </div>

                {event.max_participants > 0 && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.registrations_count} / {event.max_participants} registered
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min((event.registrations_count / event.max_participants) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Registration Fee</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.registration_fee > 0 ? `₹${event.registration_fee}` : 'Free'}
                    </p>
                  </div>
                </div>

                {event.organizer_name && (
                  <div className="pt-4 border-t dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Organized by</p>
                    <p className="font-medium">{event.organizer_name}</p>
                    {event.club_name && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{event.club_name}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Registration Button */}
              {isRegistered ? (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-center font-medium">
                  ✓ You're registered!
                </div>
              ) : isPastEvent ? (
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-4 py-3 rounded-lg text-center">
                  Event has ended
                </div>
              ) : isFull ? (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-center">
                  Event is full
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full btn-primary justify-center disabled:opacity-50"
                >
                  {registering ? 'Registering...' : event.is_external_registration ? (
                    <>
                      Register Now <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  ) : 'Register Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails

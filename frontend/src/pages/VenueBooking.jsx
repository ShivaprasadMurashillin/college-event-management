import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, Clock, Search, Filter } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import VenueCalendar from '../components/venues/VenueCalendar'

const VenueBooking = () => {
  const { isAuthenticated, isOrganizer } = useAuth()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({
    event_title: '',
    start_time: '',
    end_time: '',
    purpose: ''
  })

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues')
      if (response.data.success) {
        setVenues(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
      // Set some mock venues for demo
      setVenues([
        { id: 1, name: 'Main Auditorium', location: 'Block A', capacity: 500, amenities: ['Projector', 'AC', 'Sound System'] },
        { id: 2, name: 'Seminar Hall 1', location: 'Block B', capacity: 100, amenities: ['Projector', 'AC', 'Whiteboard'] },
        { id: 3, name: 'Conference Room', location: 'Admin Block', capacity: 30, amenities: ['TV Screen', 'AC', 'Video Conferencing'] },
        { id: 4, name: 'Open Air Theatre', location: 'Campus Ground', capacity: 1000, amenities: ['Stage', 'Lighting', 'Sound System'] },
        { id: 5, name: 'Computer Lab', location: 'Block C', capacity: 60, amenities: ['Computers', 'AC', 'Projector'] },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSlotSelect = (slotInfo) => {
    setSelectedSlot(slotInfo)
    setShowBookingForm(true)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/venues/book', {
        venue_id: selectedVenue.id,
        date: selectedSlot.date,
        ...bookingData
      })
      alert('Booking request submitted successfully!')
      setShowBookingForm(false)
      setSelectedSlot(null)
      setBookingData({ event_title: '', start_time: '', end_time: '', purpose: '' })
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit booking request')
    }
  }

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
              Venue Booking
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Browse and book venues for your events
            </p>
          </div>
          
          {/* Search */}
          <div className="mt-4 md:mt-0 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Venue List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Venues ({filteredVenues.length})
            </h2>
            
            {filteredVenues.map(venue => (
              <div
                key={venue.id}
                onClick={() => setSelectedVenue(venue)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedVenue?.id === venue.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 hover:shadow-md'
                }`}
              >
                <h3 className={`font-semibold ${
                  selectedVenue?.id === venue.id ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {venue.name}
                </h3>
                <div className={`flex items-center gap-1 text-sm mt-1 ${
                  selectedVenue?.id === venue.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <MapPin className="w-4 h-4" />
                  {venue.location}
                </div>
                <div className={`flex items-center gap-1 text-sm mt-1 ${
                  selectedVenue?.id === venue.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <Users className="w-4 h-4" />
                  Capacity: {venue.capacity}
                </div>
                {venue.amenities && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {venue.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-0.5 rounded ${
                          selectedVenue?.id === venue.id
                            ? 'bg-white/20'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Calendar Section */}
          <div className="lg:col-span-2">
            {selectedVenue ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedVenue.name} - Availability Calendar
                </h2>
                
                <VenueCalendar
                  venueId={selectedVenue.id}
                  onSelectSlot={isOrganizer ? handleSlotSelect : null}
                />

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Partially Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 border border-red-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fully Booked</span>
                  </div>
                </div>

                {!isOrganizer && isAuthenticated && (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">
                    Only organizers can book venues. Contact an organizer to book this venue.
                  </p>
                )}
                
                {!isAuthenticated && (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">
                    Please login to view detailed availability and book venues.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a Venue
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Click on a venue from the list to view its availability calendar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingForm && selectedSlot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Book {selectedVenue?.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Date: {selectedSlot.date}
              </p>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Title</label>
                  <input
                    type="text"
                    value={bookingData.event_title}
                    onChange={(e) => setBookingData(prev => ({ ...prev, event_title: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input
                      type="time"
                      value={bookingData.start_time}
                      onChange={(e) => setBookingData(prev => ({ ...prev, start_time: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input
                      type="time"
                      value={bookingData.end_time}
                      onChange={(e) => setBookingData(prev => ({ ...prev, end_time: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Purpose</label>
                  <textarea
                    value={bookingData.purpose}
                    onChange={(e) => setBookingData(prev => ({ ...prev, purpose: e.target.value }))}
                    className="input-field"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingForm(false)
                      setSelectedSlot(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary justify-center"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VenueBooking

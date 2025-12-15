import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Upload, X, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const EditEvent = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    event_date: '',
    event_time: '',
    venue: '',
    max_attendees: '',
    registration_fee: '0',
    is_external_registration: false,
    external_registration_link: '',
    status: 'draft'
  })
  const [bannerFile, setBannerFile] = useState(null)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/organizer/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const event = response.data.data
        // Split datetime into date and time
        const eventDate = new Date(event.date)
        const dateStr = eventDate.toISOString().split('T')[0]
        const timeStr = eventDate.toTimeString().substring(0, 5)
        
        setFormData({
          title: event.title || '',
          description: event.description || '',
          category: event.category || 'technical',
          event_date: dateStr,
          event_time: timeStr,
          venue: event.venue || '',
          max_attendees: event.max_participants || '',
          registration_fee: event.registration_fee || '0',
          is_external_registration: !!event.requirements,
          external_registration_link: event.requirements || '',
          status: event.status || 'draft'
        })
        if (event.banner_url) {
          setBannerPreview(`http://localhost:5000${event.banner_url}`)
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to load event')
      navigate('/organizer')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleBannerChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const removeBanner = () => {
    setBannerFile(null)
    setBannerPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const submitData = new FormData()

      // Combine date and time into datetime
      const datetime = `${formData.event_date} ${formData.event_time}:00`

      // Append form fields with correct names matching backend schema
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('date', datetime)
      submitData.append('venue', formData.venue)
      submitData.append('max_participants', formData.max_attendees || 0)
      submitData.append('registration_fee', formData.registration_fee)
      submitData.append('status', formData.status)
      
      if (formData.is_external_registration) {
        submitData.append('requirements', formData.external_registration_link)
      }

      if (bannerFile) {
        submitData.append('banner', bannerFile)
      }

      const response = await axios.put(
        `${API_URL}/organizer/events/${id}`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.success) {
        toast.success('Event updated successfully!')
        navigate('/organizer')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error(error.response?.data?.message || 'Failed to update event')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate('/organizer')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-8 font-heading">Edit Event</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Event Banner</label>
          {bannerPreview ? (
            <div className="relative">
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeBanner}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload banner image (Max 5MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Event Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="competition">Competition</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Event Date *</label>
            <input
              type="date"
              name="event_date"
              value={formData.event_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Event Time *</label>
            <input
              type="time"
              name="event_time"
              value={formData.event_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Venue *</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Maximum Attendees</label>
            <input
              type="number"
              name="max_attendees"
              value={formData.max_attendees}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Registration Fee (₹)</label>
            <input
              type="number"
              name="registration_fee"
              value={formData.registration_fee}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_external_registration"
              checked={formData.is_external_registration}
              onChange={handleChange}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Use External Registration Link</span>
          </label>
          {formData.is_external_registration && (
            <input
              type="url"
              name="external_registration_link"
              value={formData.external_registration_link}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 mt-2"
              placeholder="https://forms.google.com/..."
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/organizer')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 btn-primary justify-center disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditEvent

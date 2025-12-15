import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, X, ArrowLeft, Image as ImageIcon, Trash2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ManageMedia = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    fetchEventAndMedia()
  }, [id])

  const fetchEventAndMedia = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [eventRes, mediaRes] = await Promise.all([
        axios.get(`${API_URL}/organizer/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/events/${id}/media`)
      ])

      if (eventRes.data.success) {
        setEvent(eventRes.data.data)
      }

      if (mediaRes.data.success) {
        setMedia(mediaRes.data.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load event media')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate file sizes
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    setSelectedFiles(validFiles)
    
    // Create previews
    const newPreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }))
    setPreviews(newPreviews)
  }

  const removePreview = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index))
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    setUploading(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()

      selectedFiles.forEach((file) => {
        formData.append('media', file)
      })

      const response = await axios.post(
        `${API_URL}/organizer/events/${id}/media/gallery`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.success) {
        toast.success(`${selectedFiles.length} file(s) uploaded successfully!`)
        setSelectedFiles([])
        setPreviews([])
        fetchEventAndMedia()
      }
    } catch (error) {
      console.error('Error uploading media:', error)
      toast.error(error.response?.data?.message || 'Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(
        `${API_URL}/organizer/media/${mediaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        toast.success('Image deleted successfully!')
        fetchEventAndMedia()
      }
    } catch (error) {
      console.error('Error deleting media:', error)
      toast.error('Failed to delete image')
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button
        onClick={() => navigate('/organizer-dashboard')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-heading">Manage Event Media</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {event?.title}
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-xl font-bold mb-6">Upload New Images</h2>
        
        <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition block">
          <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg mb-2">Click to select images</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select multiple images (Max 5MB each)
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        {/* Preview Selected Files */}
        {previews.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-4">Selected Files ({previews.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                    {preview.file.name}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : `Upload ${previews.length} Image(s)`}
            </button>
          </div>
        )}
      </div>

      {/* Existing Media */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          Event Gallery ({media.length})
        </h2>

        {media.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No media uploaded yet. Upload images to create a gallery for this event.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {media.map((item) => (
              <div key={item.id} className="relative group">
                <img
                  src={`http://localhost:5000${item.file_url}`}
                  alt={item.file_name || 'Event image'}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition flex items-center justify-center rounded-lg">
                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
                {item.file_name && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 truncate">
                    {item.file_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageMedia

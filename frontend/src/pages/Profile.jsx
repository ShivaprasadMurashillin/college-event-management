import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building, Calendar, Award, Edit2, Save, X, Camera } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import API_URL from '../config/api'

const Profile = () => {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    year: '',
    club_name: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const profileData = response.data.data
        setProfile(profileData)
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          department: profileData.department || '',
          year: profileData.year || '',
          club_name: profileData.club_name || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB')
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')

      // Update profile data
      const response = await axios.put(
        `${API_URL}/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Upload avatar if selected
      if (avatarFile) {
        const avatarData = new FormData()
        avatarData.append('avatar', avatarFile)

        await axios.post(
          `${API_URL}/profile/avatar`,
          avatarData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
      }

      if (response.data.success) {
        toast.success('Profile updated successfully!')
        setEditing(false)
        setAvatarFile(null)
        setAvatarPreview(null)
        fetchProfile()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setAvatarFile(null)
    setAvatarPreview(null)
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      department: profile?.department || '',
      year: profile?.year || '',
      club_name: profile?.club_name || ''
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const displayAvatar = avatarPreview || (profile?.avatar_url ? `http://localhost:5000${profile.avatar_url}` : null)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-heading">My Profile</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary"
          >
            <Edit2 className="w-5 h-5" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Stats */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <h2 className="text-xl font-bold mb-1">{profile?.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {profile?.role === 'admin' ? 'Administrator' : profile?.role === 'organizer' ? 'Event Organizer' : 'Student'}
            </p>

            {profile?.stats && (
              <div className="space-y-3 mt-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary">{profile.stats.total_registrations}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Events Registered</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-500">{profile.stats.attended_events}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Events Attended</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-2xl font-bold text-accent">{profile.stats.certificates_earned}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">Personal Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">{profile?.name || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500">{profile?.email || '-'}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                    placeholder="1234567890"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">{profile?.phone || '-'}</p>
                )}
              </div>

              {profile?.role === 'user' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      Department
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Computer Science"
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">{profile?.department || '-'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Year
                    </label>
                    {editing ? (
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">Select Year</option>
                        <option value="1">First Year</option>
                        <option value="2">Second Year</option>
                        <option value="3">Third Year</option>
                        <option value="4">Fourth Year</option>
                      </select>
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {profile?.year ? `Year ${profile.year}` : '-'}
                      </p>
                    )}
                  </div>
                </>
              )}

              {profile?.role === 'organizer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Award className="w-4 h-4 inline mr-2" />
                    Club Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="club_name"
                      value={formData.club_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Tech Club"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">{profile?.club_name || '-'}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Created
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

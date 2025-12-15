import { useState, useEffect } from 'react'
import { Users, Calendar, UserCheck, TrendingUp, Plus, Edit, Trash2, CheckCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, organizers: 0, events: 0, registrations: 0 })
  const [organizers, setOrganizers] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    club_name: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchOrganizers()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchOrganizers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/admin/organizers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setOrganizers(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching organizers:', error)
    }
  }

  const handleCreateOrganizer = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/admin/organizers`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        toast.success('Organizer created successfully!')
        setCreatedCredentials({
          username: formData.username,
          password: formData.password,
          name: formData.name
        })
        setShowCreateModal(false)
        setShowSuccessModal(true)
        setFormData({ username: '', password: '', name: '', club_name: '', phone: '' })
        fetchOrganizers()
        fetchStats()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create organizer')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrganizer = async (id) => {
    if (!confirm('Are you sure you want to delete this organizer?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/admin/organizers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        toast.success('Organizer deleted successfully!')
        fetchOrganizers()
        fetchStats()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete organizer')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-heading">Admin Dashboard</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          Create Organizer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Students</p>
              <p className="text-3xl font-bold mt-2">{stats.users}</p>
            </div>
            <Users className="w-12 h-12 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Organizers</p>
              <p className="text-3xl font-bold mt-2">{stats.organizers}</p>
            </div>
            <UserCheck className="w-12 h-12 text-accent opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Events</p>
              <p className="text-3xl font-bold mt-2">{stats.events}</p>
            </div>
            <Calendar className="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Registrations</p>
              <p className="text-3xl font-bold mt-2">{stats.registrations}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Organizers List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">All Organizers</h2>
        {organizers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No organizers yet</p>
            <p className="text-gray-500 mb-4">Create organizer accounts to allow them to post events</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus className="w-5 h-5" />
              Create First Organizer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold">Username</th>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Club Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold">Events Posted</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizers.map((organizer) => (
                  <tr key={organizer.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium text-primary">{organizer.username}</span>
                    </td>
                    <td className="py-3 px-4">{organizer.name}</td>
                    <td className="py-3 px-4">{organizer.club_name || '-'}</td>
                    <td className="py-3 px-4">{organizer.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                        {organizer.events_count} events
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteOrganizer(organizer.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Delete organizer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Success Modal - Show Created Credentials */}
      {showSuccessModal && createdCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Organizer Created!</h2>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                Share these credentials with {createdCredentials.name}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">Username</label>
                  <div className="bg-white dark:bg-gray-800 border-2 border-primary rounded px-4 py-3 font-mono font-bold text-lg">
                    {createdCredentials.username}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">Password</label>
                  <div className="bg-white dark:bg-gray-800 border-2 border-primary rounded px-4 py-3 font-mono font-bold text-lg">
                    {createdCredentials.password}
                  </div>
                </div>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-4 text-center">
                ⚠️ Save these credentials! You won't see the password again.
              </p>
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false)
                setCreatedCredentials(null)
              }}
              className="w-full btn-primary justify-center"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Create Organizer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Create Organizer Account</h2>
            <form onSubmit={handleCreateOrganizer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                  placeholder="organizer_username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Club Name</label>
                <input
                  type="text"
                  value={formData.club_name}
                  onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Technical Club, Sports Club, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                  placeholder="1234567890"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary justify-center disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Organizer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

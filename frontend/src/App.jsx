import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layout
import Layout from './components/layout/Layout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Registration from './pages/Registration'
import OrganizerDashboard from './pages/OrganizerDashboard'
import CreateEvent from './pages/CreateEvent'
import EditEvent from './pages/EditEvent'
import ManageMedia from './pages/ManageMedia'
import VenueBooking from './pages/VenueBooking'
import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/UserManagement'

// New Feature Pages
import Notifications from './pages/Notifications'
import Referrals from './pages/Referrals'
import Support from './pages/Support'

// Protected Route Components
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Routes with Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/support" element={<Support />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/events/:id/register" element={<Registration />} />
          <Route path="/venues" element={<VenueBooking />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/referrals" element={<Referrals />} />
        </Route>

        {/* Protected Organizer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['organizer', 'admin']} />}>
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/events/new" element={<CreateEvent />} />
          <Route path="/organizer/events/:id/edit" element={<EditEvent />} />
          <Route path="/organizer/events/:id/media" element={<ManageMedia />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>
      </Route>

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

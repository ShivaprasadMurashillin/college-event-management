import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'
import API_URL from '../config/api'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginType, setLoginType] = useState('student') // 'student' or 'staff'
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_URL}/auth/google`
  }

  const handleStaffLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: formData.username,
        password: formData.password
      })

      if (response.data.success) {
        login(response.data.token, response.data.user)
        toast.success(`Welcome back, ${response.data.user.name}!`)
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate('/admin')
        } else if (response.data.user.role === 'organizer') {
          navigate('/organizer')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-custom-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-xl mb-4">
              <span className="text-white text-3xl">🎓</span>
            </div>
            <h1 className="text-3xl font-bold font-heading mb-2">
              Welcome to <span className="gradient-text">CampusEvents</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Login to discover amazing campus events
            </p>
          </div>

          {/* Login Type Switcher */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => setLoginType('student')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                loginType === 'student'
                  ? 'bg-white dark:bg-gray-800 text-primary shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setLoginType('staff')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                loginType === 'staff'
                  ? 'bg-white dark:bg-gray-800 text-primary shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Admin / Organizer
            </button>
          </div>

          {/* Student Login (Google OAuth) */}
          {loginType === 'student' && (
            <>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span>Secure OAuth 2.0 Authentication</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span>No password to remember</span>
                </div>
              </div>
            </>
          )}

          {/* Staff Login (Username/Password) */}
          {loginType === 'staff' && (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5" />
                <span>{loading ? 'Logging in...' : 'Login'}</span>
              </button>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Default Admin:</strong> username: <code>admin</code> / password: <code>admin@admin</code>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Terms */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default Login

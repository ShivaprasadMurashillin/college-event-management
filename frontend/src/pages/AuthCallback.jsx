import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

const AuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        toast.error('Authentication failed. Please try again.')
        navigate('/login')
        return
      }

      if (!token) {
        toast.error('No authentication token received')
        navigate('/login')
        return
      }

      try {
        // First save the token to localStorage so API interceptor can use it
        localStorage.setItem('token', token)
        
        // Then verify token and get user data
        const { data } = await authAPI.getCurrentUser()
        
        // Save user data using login function
        login(token, data.user)

        toast.success(`Welcome back, ${data.user.name}!`)
        navigate('/')
      } catch (error) {
        console.error('Auth callback error:', error)
        localStorage.removeItem('token')
        toast.error('Failed to complete authentication')
        navigate('/login')
      }
    }

    handleCallback()
  }, [searchParams, navigate, login])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <LoadingSpinner size="large" />
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
        Completing authentication...
      </p>
    </div>
  )
}

export default AuthCallback

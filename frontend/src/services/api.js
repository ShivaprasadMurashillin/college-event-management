import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code
      
      if (errorCode === 'TOKEN_EXPIRED') {
        // Clear token and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
      } else if (errorCode === 'INVALID_TOKEN' || errorCode === 'NO_TOKEN') {
        // Invalid token - clear and redirect
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// API Methods

// Auth
export const authAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  verifyToken: (token) => api.post('/auth/verify', { token }),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
}

// Events
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  getCategories: () => api.get('/events/meta/categories'),
  getMedia: (id, params) => api.get(`/events/${id}/media`, { params }),
}

// Organizer
export const organizerAPI = {
  getMyEvents: (params) => api.get('/organizer/events', { params }),
  createEvent: (data) => api.post('/organizer/events', data),
  updateEvent: (id, data) => api.put(`/organizer/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/organizer/events/${id}`),
  getRegistrations: (id, params) => api.get(`/organizer/events/${id}/registrations`, { params }),
  markAttendance: (id, attended) => api.put(`/organizer/registrations/${id}/attendance`, { attended }),
  uploadBanner: (id, formData) => api.post(`/organizer/events/${id}/media/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadGallery: (id, formData) => api.post(`/organizer/events/${id}/media/gallery`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMedia: (id) => api.delete(`/organizer/media/${id}`),
}

// Registrations
export const registrationsAPI = {
  register: (data) => api.post('/registrations', data),
  getMyRegistrations: (params) => api.get('/registrations/my', { params }),
  getById: (id) => api.get(`/registrations/${id}`),
  cancel: (id) => api.delete(`/registrations/${id}`),
}

// Certificates
export const certificatesAPI = {
  download: (registrationId) => api.get(`/certificates/${registrationId}`, {
    responseType: 'blob'
  }),
  regenerate: (registrationId) => api.post(`/certificates/${registrationId}/regenerate`),
}

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  updateInterests: (interests) => api.put('/profile/interests', { interests }),
  uploadAvatar: (formData) => api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getRegistrations: (params) => api.get('/profile/registrations', { params }),
  getCertificates: () => api.get('/profile/certificates'),
}

// Admin
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getEvents: (params) => api.get('/admin/events', { params }),
  updateEventStatus: (id, status) => api.put(`/admin/events/${id}/status`, { status }),
  getAnalytics: () => api.get('/admin/analytics'),
  getOrganizers: () => api.get('/admin/organizers'),
}

// Venues
export const venuesAPI = {
  getAll: (params) => api.get('/venues', { params }),
  getById: (id) => api.get(`/venues/${id}`),
  checkAvailability: (id, date) => api.get(`/venues/${id}/availability`, { params: { date } }),
  book: (data) => api.post('/venues/book', data),
  getMyBookings: () => api.get('/venues/bookings/my'),
  updateBookingStatus: (id, status) => api.put(`/venues/bookings/${id}/status`, { status }),
}

export default api

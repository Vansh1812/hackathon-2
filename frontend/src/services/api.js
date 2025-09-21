import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data)
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const endpoints = {
  // Health check
  health: '/health',
  
  // Stops
  stops: {
    list: '/stops',
    nearby: '/stops/nearby',
    detail: (id) => `/stops/${id}`,
    create: '/stops',
    update: (id) => `/stops/${id}`,
    delete: (id) => `/stops/${id}`,
  },
  
  // Routes
  routes: {
    list: '/routes',
    detail: (id) => `/routes/${id}`,
    between: (startId, endId) => `/routes/between/${startId}/${endId}`,
    create: '/routes',
    update: (id) => `/routes/${id}`,
    delete: (id) => `/routes/${id}`,
  },
  
  // Vehicles
  vehicles: {
    list: '/vehicles',
    nearby: '/vehicles/nearby',
    detail: (id) => `/vehicles/${id}`,
    tracking: (id) => `/vehicles/${id}/tracking`,
    create: '/vehicles',
    update: (id) => `/vehicles/${id}`,
    updateLocation: (id) => `/vehicles/${id}/location`,
    updateStatus: (id) => `/vehicles/${id}/status`,
    delete: (id) => `/vehicles/${id}`,
  },
  
  // Tracking
  tracking: {
    all: '/tracking/all',
    route: (id) => `/tracking/route/${id}`,
    nearby: '/tracking/nearby',
    location: '/tracking/location',
    history: (id) => `/tracking/history/${id}`,
    eta: (id) => `/tracking/eta/${id}`,
  },
}

export default api

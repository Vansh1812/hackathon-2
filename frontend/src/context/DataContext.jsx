import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [routes, setRoutes] = useState([])
  const [stops, setStops] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [trackingData, setTrackingData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all routes
  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/routes')
      setRoutes(response.data.data || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch routes')
    } finally {
      setLoading(false)
    }
  }

  // Fetch all stops
  const fetchStops = async () => {
    try {
      setLoading(true)
      const response = await api.get('/stops')
      setStops(response.data.data || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch stops')
    } finally {
      setLoading(false)
    }
  }

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await api.get('/vehicles')
      setVehicles(response.data.data || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }

  // Fetch real-time tracking data
  const fetchTrackingData = async () => {
    try {
      const response = await api.get('/tracking/all')
      setTrackingData(response.data.data || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch tracking data')
    }
  }

  // Fetch nearby stops
  const fetchNearbyStops = async (lng, lat, radius = 1000) => {
    try {
      const response = await api.get('/stops/nearby', {
        params: { lng, lat, radius }
      })
      return response.data.data || []
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch nearby stops')
      return []
    }
  }

  // Fetch nearby vehicles
  const fetchNearbyVehicles = async (lng, lat, radius = 2000) => {
    try {
      const response = await api.get('/tracking/nearby', {
        params: { lng, lat, radius }
      })
      return response.data.data || []
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch nearby vehicles')
      return []
    }
  }

  // Fetch route vehicles
  const fetchRouteVehicles = async (routeId) => {
    try {
      const response = await api.get(`/tracking/route/${routeId}`)
      return response.data.data || []
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch route vehicles')
      return []
    }
  }

  // Fetch ETA for route
  const fetchRouteETA = async (routeId, stopId = null) => {
    try {
      const params = stopId ? { stopId } : {}
      const response = await api.get(`/tracking/eta/${routeId}`, { params })
      return response.data.data || []
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch ETA data')
      return []
    }
  }

  // Update vehicle location
  const updateVehicleLocation = async (vehicleId, locationData) => {
    try {
      const response = await api.post(`/vehicles/${vehicleId}/location`, locationData)
      return response.data.data
    } catch (err) {
      setError(err.message)
      toast.error('Failed to update vehicle location')
      throw err
    }
  }

  // Update vehicle status
  const updateVehicleStatus = async (vehicleId, status) => {
    try {
      const response = await api.put(`/vehicles/${vehicleId}/status`, { status })
      return response.data.data
    } catch (err) {
      setError(err.message)
      toast.error('Failed to update vehicle status')
      throw err
    }
  }

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchRoutes(),
        fetchStops(),
        fetchVehicles(),
        fetchTrackingData()
      ])
    }

    initializeData()

    // Set up periodic refresh for tracking data
    const interval = setInterval(fetchTrackingData, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const value = {
    // Data
    routes,
    stops,
    vehicles,
    trackingData,
    loading,
    error,
    
    // Actions
    fetchRoutes,
    fetchStops,
    fetchVehicles,
    fetchTrackingData,
    fetchNearbyStops,
    fetchNearbyVehicles,
    fetchRouteVehicles,
    fetchRouteETA,
    updateVehicleLocation,
    updateVehicleStatus,
    
    // Setters for real-time updates
    setRoutes,
    setStops,
    setVehicles,
    setTrackingData,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

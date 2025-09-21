import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Bus, 
  Route, 
  RefreshCw, 
  Layers,
  Navigation,
  Users,
  Clock
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useSocket } from '../context/SocketContext'
import LoadingSpinner from '../components/LoadingSpinner'
import VehicleMarker from '../components/VehicleMarker'
import StopMarker from '../components/StopMarker'
import MapControls from '../components/MapControls'

const MapView = () => {
  const { 
    routes, 
    stops, 
    vehicles, 
    trackingData, 
    loading,
    fetchRoutes,
    fetchStops,
    fetchVehicles,
    fetchTrackingData
  } = useData()
  
  const { isConnected, joinRoute } = useSocket()
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0059]) // Default to NYC
  const [zoom, setZoom] = useState(13)
  const [showStops, setShowStops] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const mapRef = useRef(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude])
          setZoom(15)
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }, [])

  // Join route for real-time updates
  useEffect(() => {
    if (selectedRoute && isConnected) {
      joinRoute(selectedRoute._id)
    }
  }, [selectedRoute, isConnected, joinRoute])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchRoutes(),
        fetchStops(),
        fetchVehicles(),
        fetchTrackingData()
      ])
    } finally {
      setRefreshing(false)
    }
  }

  const handleRouteSelect = (route) => {
    setSelectedRoute(route)
    setSelectedVehicle(null)
    
    // Center map on route
    if (route.stops && route.stops.length > 0) {
      const firstStop = route.stops[0].stop
      if (firstStop && firstStop.location) {
        setMapCenter([firstStop.location.coordinates[1], firstStop.location.coordinates[0]])
        setZoom(14)
      }
    }
  }

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle)
    if (vehicle.currentLocation && vehicle.currentLocation.coordinates) {
      setMapCenter([vehicle.currentLocation.coordinates[1], vehicle.currentLocation.coordinates[0]])
      setZoom(16)
    }
  }

  // Get route polyline coordinates
  const getRoutePolyline = (route) => {
    if (!route.stops) return []
    return route.stops
      .sort((a, b) => a.sequence - b.sequence)
      .map(stop => [stop.stop.location.coordinates[1], stop.stop.location.coordinates[0]])
  }

  // Get active vehicles for selected route
  const getRouteVehicles = () => {
    if (!selectedRoute) return trackingData
    return trackingData.filter(vehicle => 
      vehicle.route && vehicle.route._id === selectedRoute._id
    )
  }

  if (loading && !refreshing) {
    return <LoadingSpinner text="Loading map data..." />
  }

  return (
    <div className="map-view">
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100vh', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route Polylines */}
          {showRoutes && routes.map(route => (
            <Polyline
              key={route._id}
              positions={getRoutePolyline(route)}
              color={route.color || '#3b82f6'}
              weight={selectedRoute?._id === route._id ? 4 : 2}
              opacity={selectedRoute?._id === route._id ? 0.8 : 0.5}
            />
          ))}

          {/* Stop Markers */}
          {showStops && stops.map(stop => (
            <StopMarker
              key={stop._id}
              stop={stop}
              isSelected={selectedRoute?.stops?.some(s => s.stop._id === stop._id)}
            />
          ))}

          {/* Vehicle Markers */}
          {getRouteVehicles().map(vehicle => (
            <VehicleMarker
              key={vehicle.id || vehicle._id}
              vehicle={vehicle}
              isSelected={selectedVehicle?.id === vehicle.id}
              onClick={() => handleVehicleSelect(vehicle)}
            />
          ))}
        </MapContainer>

        {/* Map Controls */}
        <MapControls
          routes={routes}
          selectedRoute={selectedRoute}
          onRouteSelect={handleRouteSelect}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showStops={showStops}
          showRoutes={showRoutes}
          onToggleStops={() => setShowStops(!showStops)}
          onToggleRoutes={() => setShowRoutes(!showRoutes)}
          isConnected={isConnected}
        />

        {/* Vehicle Info Panel */}
        {selectedVehicle && (
          <motion.div
            className="vehicle-info-panel"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
          >
            <div className="panel-header">
              <h3>Vehicle Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedVehicle(null)}
              >
                ×
              </button>
            </div>
            <div className="panel-content">
              <div className="vehicle-basic-info">
                <div className="vehicle-number">
                  <Bus size={20} />
                  <span>{selectedVehicle.vehicleNumber}</span>
                </div>
                <div className="vehicle-status">
                  <span className={`status-badge ${selectedVehicle.status}`}>
                    {selectedVehicle.status}
                  </span>
                </div>
              </div>

              {selectedVehicle.route && (
                <div className="route-info">
                  <div 
                    className="route-badge"
                    style={{ backgroundColor: selectedVehicle.route.color }}
                  >
                    {selectedVehicle.route.number}
                  </div>
                  <span className="route-name">{selectedVehicle.route.name}</span>
                </div>
              )}

              <div className="vehicle-stats">
                <div className="stat-item">
                  <Users size={16} />
                  <span>Occupancy: {selectedVehicle.occupancy || 0}/{selectedVehicle.capacity || 50}</span>
                </div>
                <div className="stat-item">
                  <Navigation size={16} />
                  <span>Speed: {selectedVehicle.speed || 0} km/h</span>
                </div>
                <div className="stat-item">
                  <Clock size={16} />
                  <span>Updated: {new Date(selectedVehicle.lastUpdated || selectedVehicle.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {selectedVehicle.currentStop && (
                <div className="current-stop">
                  <MapPin size={16} />
                  <span>At: {selectedVehicle.currentStop.name}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .map-view {
          height: 100vh;
          position: relative;
        }

        .map-container {
          height: 100%;
          width: 100%;
          position: relative;
        }

        .vehicle-info-panel {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 320px;
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border-color);
          z-index: 1000;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .panel-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
        }

        .close-btn:hover {
          background: var(--bg-tertiary);
        }

        .panel-content {
          padding: 1.5rem;
        }

        .vehicle-basic-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .vehicle-number {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.active {
          background: rgb(16 185 129 / 0.1);
          color: var(--success-color);
        }

        .status-badge.inactive {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        .route-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .route-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .route-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .vehicle-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .current-stop {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .vehicle-info-panel {
            width: calc(100% - 40px);
            right: 20px;
            left: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default MapView

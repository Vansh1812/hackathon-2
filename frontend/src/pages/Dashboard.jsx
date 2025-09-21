import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bus, 
  MapPin, 
  Route, 
  Clock, 
  Users, 
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useSocket } from '../context/SocketContext'
import VehicleCard from '../components/VehicleCard'
import RouteCard from '../components/RouteCard'
import StatsCard from '../components/StatsCard'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
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
  
  const { isConnected } = useSocket()
  const [refreshing, setRefreshing] = useState(false)

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

  // Calculate statistics
  const stats = {
    totalRoutes: routes.length,
    totalStops: stops.length,
    activeVehicles: vehicles.filter(v => v.status === 'active').length,
    totalVehicles: vehicles.length,
    averageOccupancy: vehicles.length > 0 
      ? Math.round(vehicles.reduce((sum, v) => sum + (v.occupancy || 0), 0) / vehicles.length)
      : 0,
    totalPassengers: vehicles.reduce((sum, v) => sum + (v.occupancy || 0), 0)
  }

  // Get recent tracking data
  const recentVehicles = trackingData
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 6)

  if (loading && !refreshing) {
    return <LoadingSpinner />
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Transport Dashboard</h1>
            <p className="dashboard-subtitle">
              Real-time monitoring of your city's public transport system
            </p>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'loading' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Connection Status Alert */}
        {!isConnected && (
          <motion.div
            className="alert alert-warning"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={20} />
            <span>Real-time updates are offline. Data may not be current.</span>
          </motion.div>
        )}

        {/* Statistics Cards */}
        <div className="stats-grid">
          <StatsCard
            title="Active Routes"
            value={stats.totalRoutes}
            icon={Route}
            color="blue"
            trend={stats.totalRoutes > 0 ? '+' + stats.totalRoutes : '0'}
          />
          <StatsCard
            title="Bus Stops"
            value={stats.totalStops}
            icon={MapPin}
            color="green"
            trend={stats.totalStops > 0 ? '+' + stats.totalStops : '0'}
          />
          <StatsCard
            title="Active Vehicles"
            value={stats.activeVehicles}
            icon={Bus}
            color="purple"
            trend={`${stats.activeVehicles}/${stats.totalVehicles}`}
          />
          <StatsCard
            title="Total Passengers"
            value={stats.totalPassengers}
            icon={Users}
            color="orange"
            trend={`Avg: ${stats.averageOccupancy}`}
          />
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Recent Vehicle Activity */}
          <motion.div
            className="dashboard-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="section-header">
              <h2 className="section-title">
                <Bus size={20} />
                Recent Vehicle Activity
              </h2>
              <span className="section-subtitle">
                Live tracking updates
              </span>
            </div>
            <div className="vehicle-list">
              {recentVehicles.length > 0 ? (
                recentVehicles.map((vehicle, index) => (
                  <VehicleCard
                    key={vehicle.id || index}
                    vehicle={vehicle}
                    compact
                  />
                ))
              ) : (
                <div className="empty-state">
                  <Bus size={48} />
                  <p>No recent vehicle activity</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Route Overview */}
          <motion.div
            className="dashboard-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="section-header">
              <h2 className="section-title">
                <Route size={20} />
                Route Overview
              </h2>
              <span className="section-subtitle">
                All available routes
              </span>
            </div>
            <div className="route-list">
              {routes.length > 0 ? (
                routes.slice(0, 4).map((route) => (
                  <RouteCard
                    key={route._id}
                    route={route}
                    compact
                  />
                ))
              ) : (
                <div className="empty-state">
                  <Route size={48} />
                  <p>No routes available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="quick-actions-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="quick-action-btn">
              <MapPin size={24} />
              <span>Find Nearby Stops</span>
            </button>
            <button className="quick-action-btn">
              <Bus size={24} />
              <span>Track Vehicle</span>
            </button>
            <button className="quick-action-btn">
              <Route size={24} />
              <span>Plan Journey</span>
            </button>
            <button className="quick-action-btn">
              <Clock size={24} />
              <span>Check Schedule</span>
            </button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .dashboard {
          padding: 2rem 0;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: var(--radius-lg);
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .alert-warning {
          background: rgb(245 158 11 / 0.1);
          color: var(--warning-color);
          border: 1px solid rgb(245 158 11 / 0.2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .dashboard-section {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }

        .section-header {
          margin-bottom: 1.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .vehicle-list,
        .route-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          text-align: center;
        }

        .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .quick-actions {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }

        .quick-actions-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-primary);
        }

        .quick-action-btn:hover {
          background: var(--primary-color);
          color: white;
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
          }

          .dashboard-title {
            font-size: 2rem;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }

          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard

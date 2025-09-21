import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, Filter, Plus, Route, Wifi, Accessibility } from 'lucide-react'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/LoadingSpinner'

const StopsPage = () => {
  const { stops, loading } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('all')
  const [filterFacility, setFilterFacility] = useState('all')

  const cities = [...new Set(stops.map(stop => stop.city))]

  const filteredStops = stops.filter(stop => {
    const matchesSearch = stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stop.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = filterCity === 'all' || stop.city === filterCity
    const matchesFacility = filterFacility === 'all' || 
                           (stop.facilities && stop.facilities.includes(filterFacility))
    return matchesSearch && matchesCity && matchesFacility
  })

  const totalStops = stops.length
  const stopsWithWifi = stops.filter(stop => stop.facilities?.includes('wifi')).length
  const accessibleStops = stops.filter(stop => stop.facilities?.includes('accessibility')).length
  const totalRoutes = stops.reduce((sum, stop) => sum + (stop.routes?.length || 0), 0)

  if (loading) {
    return <LoadingSpinner text="Loading stops..." />
  }

  return (
    <div className="stops-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Bus Stops</h1>
            <p className="page-subtitle">
              View and manage all bus stops in the city
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus size={16} />
            Add Stop
          </button>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <MapPin size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalStops}</div>
              <div className="stat-label">Total Stops</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Route size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalRoutes}</div>
              <div className="stat-label">Route Connections</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Wifi size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stopsWithWifi}</div>
              <div className="stat-label">WiFi Enabled</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Accessibility size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{accessibleStops}</div>
              <div className="stat-label">Accessible</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search stops by name, address, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={filterFacility}
              onChange={(e) => setFilterFacility(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Facilities</option>
              <option value="wifi">WiFi</option>
              <option value="accessibility">Accessibility</option>
              <option value="shelter">Shelter</option>
              <option value="bench">Bench</option>
              <option value="lighting">Lighting</option>
              <option value="ticket_booth">Ticket Booth</option>
            </select>
          </div>
        </div>

        {/* Stops Grid */}
        <div className="stops-grid">
          {filteredStops.length > 0 ? (
            filteredStops.map((stop, index) => (
              <motion.div
                key={stop._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <StopCard stop={stop} />
              </motion.div>
            ))
          ) : (
            <div className="empty-state">
              <MapPin size={64} />
              <h3>No stops found</h3>
              <p>
                {searchTerm || filterCity !== 'all' || filterFacility !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No stops have been added yet'
                }
              </p>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add First Stop
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .stops-page {
          padding: 2rem 0;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--success-color);
          color: white;
          border-radius: var(--radius-lg);
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .filters-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-box svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          background: var(--bg-primary);
          transition: border-color 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          cursor: pointer;
        }

        .stops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          color: var(--text-muted);
        }

        .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          margin-bottom: 1.5rem;
          max-width: 400px;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .stops-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}

// Stop Card Component
const StopCard = ({ stop }) => {
  const getFacilityIcon = (facility) => {
    switch (facility) {
      case 'wifi': return <Wifi size={14} />
      case 'accessibility': return <Accessibility size={14} />
      case 'shelter': return '🏠'
      case 'bench': return '🪑'
      case 'lighting': return '💡'
      case 'ticket_booth': return '🎫'
      default: return '📍'
    }
  }

  return (
    <div className="stop-card">
      <div className="stop-header">
        <div className="stop-info">
          <div className="stop-name">
            <MapPin size={16} />
            <span>{stop.name}</span>
          </div>
          <div className="stop-location">
            <span className="address">{stop.address}</span>
            <span className="city">{stop.city}</span>
          </div>
        </div>
        <div className="stop-status">
          <span className={`status-badge ${stop.isActive ? 'active' : 'inactive'}`}>
            {stop.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {stop.facilities && stop.facilities.length > 0 && (
        <div className="facilities">
          <span className="facilities-label">Facilities:</span>
          <div className="facilities-list">
            {stop.facilities.map((facility, index) => (
              <span key={index} className="facility-badge">
                {getFacilityIcon(facility)}
                <span>{facility.replace('_', ' ')}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {stop.routes && stop.routes.length > 0 && (
        <div className="routes">
          <span className="routes-label">Routes:</span>
          <div className="routes-list">
            {stop.routes.map((route, index) => (
              <div 
                key={index}
                className="route-badge"
                style={{ backgroundColor: route.color || '#3b82f6' }}
              >
                {route.number}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stop-footer">
        <div className="coordinates">
          {stop.location?.coordinates && (
            <span>
              {stop.location.coordinates[1].toFixed(4)}, {stop.location.coordinates[0].toFixed(4)}
            </span>
          )}
        </div>
        <div className="stop-actions">
          <button className="action-btn">View on Map</button>
          <button className="action-btn">Edit</button>
        </div>
      </div>

      <style jsx>{`
        .stop-card {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .stop-card:hover {
          box-shadow: var(--shadow-md);
        }

        .stop-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .stop-info {
          flex: 1;
        }

        .stop-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .stop-location {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .address {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .city {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
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

        .facilities,
        .routes {
          margin-bottom: 1rem;
        }

        .facilities-label,
        .routes-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .facilities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .facility-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .routes-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .route-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          color: white;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .stop-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }

        .coordinates {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: monospace;
        }

        .stop-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.25rem 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
      `}</style>
    </div>
  )
}

export default StopsPage

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Route, Search, Filter, Plus, MapPin, Clock, Users } from 'lucide-react'
import { useData } from '../context/DataContext'
import RouteCard from '../components/RouteCard'
import LoadingSpinner from '../components/LoadingSpinner'

const RoutesPage = () => {
  const { routes, loading } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && route.isActive) ||
                         (filterStatus === 'inactive' && !route.isActive)
    return matchesSearch && matchesFilter
  })

  const activeRoutes = routes.filter(route => route.isActive).length
  const totalStops = routes.reduce((sum, route) => sum + (route.stops?.length || 0), 0)
  const averageFrequency = routes.length > 0 
    ? Math.round(routes.reduce((sum, route) => sum + (route.frequency || 0), 0) / routes.length)
    : 0

  if (loading) {
    return <LoadingSpinner text="Loading routes..." />
  }

  return (
    <div className="routes-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Bus Routes</h1>
            <p className="page-subtitle">
              Manage and view all available bus routes in the city
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus size={16} />
            Add Route
          </button>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Route size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{routes.length}</div>
              <div className="stat-label">Total Routes</div>
            </div>
          </div>
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
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{averageFrequency}</div>
              <div className="stat-label">Avg Frequency (min)</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{activeRoutes}</div>
              <div className="stat-label">Active Routes</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search routes by name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Routes</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="routes-grid">
          {filteredRoutes.length > 0 ? (
            filteredRoutes.map((route, index) => (
              <motion.div
                key={route._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RouteCard route={route} />
              </motion.div>
            ))
          ) : (
            <div className="empty-state">
              <Route size={64} />
              <h3>No routes found</h3>
              <p>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No routes have been added yet'
                }
              </p>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add First Route
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .routes-page {
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
          background: var(--primary-color);
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

        .routes-grid {
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

          .routes-grid {
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

export default RoutesPage

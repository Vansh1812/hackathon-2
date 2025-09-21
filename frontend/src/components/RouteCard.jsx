import React from 'react'
import { motion } from 'framer-motion'
import { Route, Clock, MapPin, Users, ArrowRight } from 'lucide-react'

const RouteCard = ({ route, compact = false }) => {
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    return timeString
  }

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <motion.div
      className={`route-card ${compact ? 'compact' : ''}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="route-card-header">
        <div className="route-info">
          <div 
            className="route-number"
            style={{ backgroundColor: route.color || '#3b82f6' }}
          >
            {route.number}
          </div>
          <div className="route-details">
            <h3 className="route-name">{route.name}</h3>
            {route.description && (
              <p className="route-description">{route.description}</p>
            )}
          </div>
        </div>
        <div className={`status-badge ${route.isActive ? 'active' : 'inactive'}`}>
          {route.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="route-stats">
        <div className="stat-item">
          <MapPin size={14} />
          <span className="stat-label">Stops:</span>
          <span className="stat-value">{route.stops?.length || 0}</span>
        </div>
        <div className="stat-item">
          <Clock size={14} />
          <span className="stat-label">Duration:</span>
          <span className="stat-value">{formatDuration(route.estimatedDuration)}</span>
        </div>
        <div className="stat-item">
          <Users size={14} />
          <span className="stat-label">Frequency:</span>
          <span className="stat-value">{route.frequency || 0} min</span>
        </div>
      </div>

      <div className="route-schedule">
        <div className="schedule-item">
          <span className="schedule-label">Operating Hours:</span>
          <span className="schedule-value">
            {formatTime(route.operatingHours?.start)} - {formatTime(route.operatingHours?.end)}
          </span>
        </div>
        <div className="schedule-item">
          <span className="schedule-label">Fare:</span>
          <span className="schedule-value">${route.fare || 0}</span>
        </div>
      </div>

      {route.stops && route.stops.length > 0 && (
        <div className="route-stops">
          <div className="stops-header">
            <span className="stops-label">Route Stops:</span>
            <span className="stops-count">{route.stops.length} stops</span>
          </div>
          <div className="stops-preview">
            {route.stops.slice(0, 3).map((stop, index) => (
              <div key={index} className="stop-item">
                <div className="stop-sequence">{stop.sequence}</div>
                <div className="stop-name">
                  {stop.stop?.name || `Stop ${stop.sequence}`}
                </div>
                {index < Math.min(route.stops.length, 3) - 1 && (
                  <ArrowRight size={12} className="stop-arrow" />
                )}
              </div>
            ))}
            {route.stops.length > 3 && (
              <div className="more-stops">
                +{route.stops.length - 3} more stops
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .route-card {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .route-card:hover {
          box-shadow: var(--shadow-md);
        }

        .route-card.compact {
          padding: 1rem;
        }

        .route-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .route-info {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          flex: 1;
        }

        .route-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          color: white;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .route-details {
          flex: 1;
        }

        .route-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .route-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.4;
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

        .route-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .stat-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .stat-value {
          color: var(--text-primary);
          font-weight: 600;
        }

        .route-schedule {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .schedule-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .schedule-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .schedule-value {
          font-size: 0.875rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .route-stops {
          border-top: 1px solid var(--border-light);
          padding-top: 1rem;
        }

        .stops-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .stops-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stops-count {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .stops-preview {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .stop-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stop-sequence {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: var(--primary-color);
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .stop-name {
          font-size: 0.75rem;
          color: var(--text-secondary);
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .stop-arrow {
          color: var(--text-muted);
        }

        .more-stops {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .route-card {
            padding: 1rem;
          }

          .route-stats {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .route-schedule {
            flex-direction: column;
            gap: 0.75rem;
          }

          .stops-preview {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .stop-item {
            width: 100%;
          }

          .stop-name {
            max-width: none;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default RouteCard

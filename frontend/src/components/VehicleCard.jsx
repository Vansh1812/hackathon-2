import React from 'react'
import { motion } from 'framer-motion'
import { Bus, MapPin, Users, Clock, Wifi, WifiOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const VehicleCard = ({ vehicle, compact = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      case 'maintenance': return 'warning'
      case 'offline': return 'danger'
      default: return 'secondary'
    }
  }

  const getOccupancyColor = (occupancy, capacity) => {
    const percentage = (occupancy / capacity) * 100
    if (percentage >= 90) return 'danger'
    if (percentage >= 70) return 'warning'
    return 'success'
  }

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never'
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  return (
    <motion.div
      className={`vehicle-card ${compact ? 'compact' : ''}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="vehicle-card-header">
        <div className="vehicle-info">
          <div className="vehicle-number">
            <Bus size={16} />
            <span>{vehicle.vehicleNumber || vehicle.id}</span>
          </div>
          <div className="vehicle-type">
            {vehicle.type?.charAt(0).toUpperCase() + vehicle.type?.slice(1) || 'Bus'}
          </div>
        </div>
        <div className={`status-badge ${getStatusColor(vehicle.status)}`}>
          {vehicle.status || 'Unknown'}
        </div>
      </div>

      {vehicle.route && (
        <div className="vehicle-route">
          <div className="route-info">
            <span className="route-number" style={{ backgroundColor: vehicle.route.color || '#3b82f6' }}>
              {vehicle.route.number}
            </span>
            <span className="route-name">{vehicle.route.name}</span>
          </div>
        </div>
      )}

      <div className="vehicle-details">
        <div className="detail-item">
          <Users size={14} />
          <span className="detail-label">Occupancy:</span>
          <span className={`detail-value ${getOccupancyColor(vehicle.occupancy || 0, vehicle.capacity || 50)}`}>
            {vehicle.occupancy || 0}/{vehicle.capacity || 50}
          </span>
        </div>

        {vehicle.speed !== undefined && (
          <div className="detail-item">
            <Clock size={14} />
            <span className="detail-label">Speed:</span>
            <span className="detail-value">{vehicle.speed || 0} km/h</span>
          </div>
        )}

        {vehicle.currentStop && (
          <div className="detail-item">
            <MapPin size={14} />
            <span className="detail-label">At:</span>
            <span className="detail-value">{vehicle.currentStop.name}</span>
          </div>
        )}
      </div>

      <div className="vehicle-footer">
        <div className="last-update">
          <Wifi size={12} />
          <span>Updated {formatLastUpdate(vehicle.lastUpdated || vehicle.timestamp)}</span>
        </div>
        {vehicle.location && (
          <div className="location-coords">
            {vehicle.location.coordinates?.[0]?.toFixed(4)}, {vehicle.location.coordinates?.[1]?.toFixed(4)}
          </div>
        )}
      </div>

      <style jsx>{`
        .vehicle-card {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .vehicle-card:hover {
          box-shadow: var(--shadow-md);
        }

        .vehicle-card.compact {
          padding: 1rem;
        }

        .vehicle-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .vehicle-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .vehicle-number {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .vehicle-type {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.success {
          background: rgb(16 185 129 / 0.1);
          color: var(--success-color);
        }

        .status-badge.warning {
          background: rgb(245 158 11 / 0.1);
          color: var(--warning-color);
        }

        .status-badge.danger {
          background: rgb(239 68 68 / 0.1);
          color: var(--danger-color);
        }

        .status-badge.secondary {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        .vehicle-route {
          margin-bottom: 1rem;
        }

        .route-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .route-number {
          display: inline-flex;
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

        .vehicle-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .detail-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .detail-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .detail-value.success {
          color: var(--success-color);
        }

        .detail-value.warning {
          color: var(--warning-color);
        }

        .detail-value.danger {
          color: var(--danger-color);
        }

        .vehicle-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .last-update {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .location-coords {
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .vehicle-card {
            padding: 1rem;
          }

          .vehicle-details {
            gap: 0.375rem;
          }

          .detail-item {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default VehicleCard

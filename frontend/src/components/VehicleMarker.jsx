import React from 'react'
import { Marker, Popup } from 'react-leaflet'
import { Bus, Users, Navigation, Clock } from 'lucide-react'
import L from 'leaflet'

// Create custom bus icon
const createBusIcon = (status, occupancy, capacity) => {
  const occupancyPercentage = (occupancy / capacity) * 100
  let color = '#3b82f6' // Default blue
  
  if (status === 'active') {
    if (occupancyPercentage >= 90) color = '#ef4444' // Red for full
    else if (occupancyPercentage >= 70) color = '#f59e0b' // Orange for busy
    else color = '#10b981' // Green for available
  } else if (status === 'maintenance') {
    color = '#f59e0b' // Orange for maintenance
  } else if (status === 'offline') {
    color = '#6b7280' // Gray for offline
  }

  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">
        🚌
      </div>
    `,
    className: 'custom-bus-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

const VehicleMarker = ({ vehicle, isSelected, onClick }) => {
  if (!vehicle.currentLocation || !vehicle.currentLocation.coordinates) {
    return null
  }

  const position = [
    vehicle.currentLocation.coordinates[1], // latitude
    vehicle.currentLocation.coordinates[0]  // longitude
  ]

  const icon = createBusIcon(
    vehicle.status,
    vehicle.occupancy || 0,
    vehicle.capacity || 50
  )

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="vehicle-popup">
          <div className="popup-header">
            <div className="vehicle-info">
              <Bus size={16} />
              <span className="vehicle-number">{vehicle.vehicleNumber}</span>
            </div>
            <span className={`status-badge ${vehicle.status}`}>
              {vehicle.status}
            </span>
          </div>

          {vehicle.route && (
            <div className="route-info">
              <div 
                className="route-badge"
                style={{ backgroundColor: vehicle.route.color }}
              >
                {vehicle.route.number}
              </div>
              <span className="route-name">{vehicle.route.name}</span>
            </div>
          )}

          <div className="vehicle-details">
            <div className="detail-item">
              <Users size={14} />
              <span>{vehicle.occupancy || 0}/{vehicle.capacity || 50} passengers</span>
            </div>
            <div className="detail-item">
              <Navigation size={14} />
              <span>{vehicle.speed || 0} km/h</span>
            </div>
            <div className="detail-item">
              <Clock size={14} />
              <span>Updated {new Date(vehicle.lastUpdated || vehicle.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          {vehicle.currentStop && (
            <div className="current-stop">
              <span>At: {vehicle.currentStop.name}</span>
            </div>
          )}
        </div>

        <style jsx>{`
          .vehicle-popup {
            min-width: 200px;
          }

          .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
          }

          .vehicle-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: var(--text-primary);
          }

          .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: var(--radius-sm);
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
            gap: 0.5rem;
            margin-bottom: 0.75rem;
          }

          .route-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: var(--radius-sm);
            color: white;
            font-weight: 600;
            font-size: 0.75rem;
          }

          .route-name {
            font-size: 0.875rem;
            color: var(--text-primary);
          }

          .vehicle-details {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
          }

          .detail-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: var(--text-secondary);
          }

          .current-stop {
            padding: 0.5rem;
            background: var(--bg-tertiary);
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            color: var(--text-primary);
          }
        `}</style>
      </Popup>
    </Marker>
  )
}

export default VehicleMarker

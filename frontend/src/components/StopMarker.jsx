import React from 'react'
import { Marker, Popup } from 'react-leaflet'
import { MapPin, Route, Wifi, Accessibility } from 'lucide-react'
import L from 'leaflet'

// Create custom stop icon
const createStopIcon = (isSelected) => {
  const color = isSelected ? '#3b82f6' : '#10b981'
  
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
      ">
        📍
      </div>
    `,
    className: 'custom-stop-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

const StopMarker = ({ stop, isSelected }) => {
  if (!stop.location || !stop.location.coordinates) {
    return null
  }

  const position = [
    stop.location.coordinates[1], // latitude
    stop.location.coordinates[0]  // longitude
  ]

  const icon = createStopIcon(isSelected)

  return (
    <Marker
      position={position}
      icon={icon}
    >
      <Popup>
        <div className="stop-popup">
          <div className="popup-header">
            <MapPin size={16} />
            <span className="stop-name">{stop.name}</span>
          </div>

          <div className="stop-address">
            <span>{stop.address}</span>
            <span className="city">{stop.city}</span>
          </div>

          {stop.facilities && stop.facilities.length > 0 && (
            <div className="facilities">
              <span className="facilities-label">Facilities:</span>
              <div className="facilities-list">
                {stop.facilities.map((facility, index) => (
                  <span key={index} className="facility-badge">
                    {facility === 'accessibility' && <Accessibility size={12} />}
                    {facility === 'wifi' && <Wifi size={12} />}
                    {facility === 'shelter' && '🏠'}
                    {facility === 'bench' && '🪑'}
                    {facility === 'lighting' && '💡'}
                    {facility === 'ticket_booth' && '🎫'}
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
        </div>

        <style jsx>{`
          .stop-popup {
            min-width: 200px;
          }

          .popup-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
            font-weight: 600;
            color: var(--text-primary);
          }

          .stop-address {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            margin-bottom: 0.75rem;
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          .city {
            font-weight: 500;
            color: var(--text-primary);
          }

          .facilities,
          .routes {
            margin-bottom: 0.75rem;
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
            gap: 0.25rem;
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
            gap: 0.25rem;
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
        `}</style>
      </Popup>
    </Marker>
  )
}

export default StopMarker

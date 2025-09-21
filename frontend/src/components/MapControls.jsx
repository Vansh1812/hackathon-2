import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Route, 
  MapPin, 
  RefreshCw, 
  Layers,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const MapControls = ({
  routes,
  selectedRoute,
  onRouteSelect,
  onRefresh,
  refreshing,
  showStops,
  showRoutes,
  onToggleStops,
  onToggleRoutes,
  isConnected
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      className="map-controls"
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="controls-header">
        <h3>Map Controls</h3>
        <button
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <motion.div
          className="controls-content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Connection Status */}
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span>{isConnected ? 'Live Updates' : 'Offline'}</span>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            className="control-btn refresh-btn"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'loading' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>

          {/* Layer Controls */}
          <div className="layer-controls">
            <h4>Layers</h4>
            <div className="layer-options">
              <label className="layer-option">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={onToggleRoutes}
                />
                <Route size={16} />
                <span>Routes</span>
              </label>
              <label className="layer-option">
                <input
                  type="checkbox"
                  checked={showStops}
                  onChange={onToggleStops}
                />
                <MapPin size={16} />
                <span>Stops</span>
              </label>
            </div>
          </div>

          {/* Route Selection */}
          <div className="route-selection">
            <h4>Select Route</h4>
            <div className="route-list">
              <button
                className={`route-option ${!selectedRoute ? 'selected' : ''}`}
                onClick={() => onRouteSelect(null)}
              >
                <span>All Routes</span>
              </button>
              {routes.map(route => (
                <button
                  key={route._id}
                  className={`route-option ${selectedRoute?._id === route._id ? 'selected' : ''}`}
                  onClick={() => onRouteSelect(route)}
                >
                  <div 
                    className="route-color"
                    style={{ backgroundColor: route.color || '#3b82f6' }}
                  />
                  <span className="route-number">{route.number}</span>
                  <span className="route-name">{route.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Route Info */}
          {selectedRoute && (
            <div className="selected-route-info">
              <h4>Route Details</h4>
              <div className="route-details">
                <div className="detail-item">
                  <span className="label">Stops:</span>
                  <span className="value">{selectedRoute.stops?.length || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Duration:</span>
                  <span className="value">{selectedRoute.estimatedDuration || 0} min</span>
                </div>
                <div className="detail-item">
                  <span className="label">Frequency:</span>
                  <span className="value">{selectedRoute.frequency || 0} min</span>
                </div>
                <div className="detail-item">
                  <span className="label">Fare:</span>
                  <span className="value">${selectedRoute.fare || 0}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <style jsx>{`
        .map-controls {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 300px;
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border-color);
          z-index: 1000;
          max-height: calc(100vh - 40px);
          overflow: hidden;
        }

        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .controls-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .expand-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
        }

        .expand-btn:hover {
          background: var(--bg-tertiary);
        }

        .controls-content {
          padding: 1.5rem;
          overflow-y: auto;
          max-height: calc(100vh - 120px);
        }

        .connection-status {
          margin-bottom: 1rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-indicator.connected {
          background: rgb(16 185 129 / 0.1);
          color: var(--success-color);
        }

        .status-indicator.disconnected {
          background: rgb(239 68 68 / 0.1);
          color: var(--danger-color);
        }

        .control-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 1.5rem;
        }

        .control-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .control-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .layer-controls,
        .route-selection,
        .selected-route-info {
          margin-bottom: 1.5rem;
        }

        .layer-controls h4,
        .route-selection h4,
        .selected-route-info h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .layer-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .layer-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .layer-option:hover {
          background: var(--bg-tertiary);
        }

        .layer-option input[type="checkbox"] {
          margin: 0;
        }

        .route-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .route-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .route-option:hover {
          background: var(--border-color);
        }

        .route-option.selected {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .route-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .route-number {
          font-weight: 600;
          min-width: 32px;
        }

        .route-name {
          flex: 1;
          font-size: 0.875rem;
        }

        .route-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .detail-item .label {
          color: var(--text-secondary);
        }

        .detail-item .value {
          color: var(--text-primary);
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .map-controls {
            width: calc(100% - 40px);
            left: 20px;
            right: 20px;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default MapControls

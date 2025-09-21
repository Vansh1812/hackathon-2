import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Bus, 
  MapPin, 
  Route, 
  Map, 
  Wifi, 
  WifiOff,
  Menu,
  X
} from 'lucide-react'
import { useSocket } from '../context/SocketContext'

const Header = () => {
  const location = useLocation()
  const { isConnected } = useSocket()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Bus },
    { name: 'Map View', href: '/map', icon: Map },
    { name: 'Routes', href: '/routes', icon: Route },
    { name: 'Stops', href: '/stops', icon: MapPin },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <Bus className="logo-icon" />
            <span className="logo-text">Transport Tracker</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Connection Status */}
          <div className="connection-status">
            {isConnected ? (
              <div className="status-indicator connected">
                <Wifi size={16} />
                <span>Live</span>
              </div>
            ) : (
              <div className="status-indicator disconnected">
                <WifiOff size={16} />
                <span>Offline</span>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.nav
            className="nav-mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link-mobile ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </motion.nav>
        )}
      </div>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          z-index: 1000;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 1.25rem;
        }

        .logo-icon {
          color: var(--primary-color);
        }

        .nav-desktop {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .nav-link.active {
          color: var(--primary-color);
          background: rgb(59 130 246 / 0.1);
        }

        .connection-status {
          display: flex;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
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

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--radius-md);
        }

        .mobile-menu-btn:hover {
          background: var(--bg-tertiary);
        }

        .nav-mobile {
          display: none;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem 0;
          border-top: 1px solid var(--border-color);
        }

        .nav-link-mobile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-link-mobile:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .nav-link-mobile.active {
          color: var(--primary-color);
          background: rgb(59 130 246 / 0.1);
        }

        @media (max-width: 768px) {
          .nav-desktop {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .nav-mobile {
            display: flex;
          }

          .connection-status {
            display: none;
          }
        }
      `}</style>
    </header>
  )
}

export default Header

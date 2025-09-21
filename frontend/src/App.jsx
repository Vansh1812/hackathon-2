import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import MapView from './pages/MapView'
import RoutesPage from './pages/RoutesPage'
import StopsPage from './pages/StopsPage'
import { SocketProvider } from './context/SocketContext'
import { DataProvider } from './context/DataContext'
import './App.css'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <SocketProvider>
      <DataProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/routes" element={<RoutesPage />} />
                <Route path="/stops" element={<StopsPage />} />
              </Routes>
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            {!isOnline && (
              <div className="offline-banner">
                <span>📡 You're offline. Some features may not work.</span>
              </div>
            )}
          </div>
        </Router>
      </DataProvider>
    </SocketProvider>
  )
}

export default App

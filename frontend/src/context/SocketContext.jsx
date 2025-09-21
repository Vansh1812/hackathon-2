import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
      setConnectionError(null)
      toast.success('Connected to real-time updates')
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason)
      setIsConnected(false)
      if (reason === 'io server disconnect') {
        toast.error('Server disconnected')
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnectionError(error.message)
      toast.error('Failed to connect to server')
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error(error.message || 'Socket error occurred')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const joinRoute = (routeId) => {
    if (socket && isConnected) {
      socket.emit('join-route', routeId)
    }
  }

  const joinStop = (stopId) => {
    if (socket && isConnected) {
      socket.emit('join-stop', stopId)
    }
  }

  const joinVehicle = (vehicleId) => {
    if (socket && isConnected) {
      socket.emit('join-vehicle', vehicleId)
    }
  }

  const sendLocationUpdate = (data) => {
    if (socket && isConnected) {
      socket.emit('location-update', data)
    }
  }

  const sendStatusUpdate = (data) => {
    if (socket && isConnected) {
      socket.emit('status-update', data)
    }
  }

  const sendOccupancyUpdate = (data) => {
    if (socket && isConnected) {
      socket.emit('occupancy-update', data)
    }
  }

  const value = {
    socket,
    isConnected,
    connectionError,
    joinRoute,
    joinStop,
    joinVehicle,
    sendLocationUpdate,
    sendStatusUpdate,
    sendOccupancyUpdate,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

const Vehicle = require('../models/Vehicle');
const TrackingData = require('../models/TrackingData');
const Stop = require('../models/Stop');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join route-specific room for real-time updates
      socket.on('join-route', (routeId) => {
        socket.join(`route-${routeId}`);
        console.log(`Client ${socket.id} joined route ${routeId}`);
        
        // Send current vehicle positions for this route
        this.sendRouteVehicles(socket, routeId);
      });

      // Join stop-specific room for arrival notifications
      socket.on('join-stop', (stopId) => {
        socket.join(`stop-${stopId}`);
        console.log(`Client ${socket.id} joined stop ${stopId}`);
      });

      // Join vehicle-specific room for tracking
      socket.on('join-vehicle', (vehicleId) => {
        socket.join(`vehicle-${vehicleId}`);
        console.log(`Client ${socket.id} joined vehicle ${vehicleId}`);
      });

      // Handle location updates from vehicles
      socket.on('location-update', async (data) => {
        try {
          await this.handleLocationUpdate(data, socket);
        } catch (error) {
          socket.emit('error', { message: 'Failed to update location', error: error.message });
        }
      });

      // Handle vehicle status updates
      socket.on('status-update', async (data) => {
        try {
          await this.handleStatusUpdate(data, socket);
        } catch (error) {
          socket.emit('error', { message: 'Failed to update status', error: error.message });
        }
      });

      // Handle occupancy updates
      socket.on('occupancy-update', async (data) => {
        try {
          await this.handleOccupancyUpdate(data, socket);
        } catch (error) {
          socket.emit('error', { message: 'Failed to update occupancy', error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  async handleLocationUpdate(data, socket) {
    const { vehicleId, coordinates, speed, heading, accuracy, status } = data;

    // Validate required fields
    if (!vehicleId || !coordinates || coordinates.length !== 2) {
      socket.emit('error', { message: 'Invalid location data' });
      return;
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      socket.emit('error', { message: 'Vehicle not found' });
      return;
    }

    // Update vehicle location
    vehicle.currentLocation = {
      type: 'Point',
      coordinates: coordinates
    };
    vehicle.speed = speed || 0;
    vehicle.heading = heading || 0;
    vehicle.lastUpdated = new Date();

    // Find nearest stop
    const nearestStop = await Stop.findOne({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: 100 // within 100 meters
        }
      },
      routes: vehicle.route,
      isActive: true
    });

    if (nearestStop) {
      vehicle.currentStop = nearestStop._id;
    }

    await vehicle.save();

    // Save tracking data
    const trackingData = new TrackingData({
      vehicle: vehicle._id,
      route: vehicle.route,
      location: vehicle.currentLocation,
      speed: speed || 0,
      heading: heading || 0,
      accuracy: accuracy || 10,
      status: status || 'moving',
      stop: nearestStop ? nearestStop._id : null,
      distanceFromStop: nearestStop ? 
        this.calculateDistance(coordinates, nearestStop.location.coordinates) : 0,
      timestamp: new Date()
    });

    await trackingData.save();

    // Emit location update to relevant rooms
    const vehicleData = {
      id: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      location: vehicle.currentLocation,
      speed: vehicle.speed,
      heading: vehicle.heading,
      lastUpdated: vehicle.lastUpdated,
      currentStop: vehicle.currentStop,
      status: vehicle.status
    };

    // Broadcast to route room
    this.io.to(`route-${vehicle.route}`).emit('vehicle-location-update', vehicleData);

    // Broadcast to vehicle room
    this.io.to(`vehicle-${vehicle._id}`).emit('location-updated', vehicleData);

    // If near a stop, notify stop room
    if (nearestStop) {
      this.io.to(`stop-${nearestStop._id}`).emit('vehicle-arrival', {
        vehicle: vehicleData,
        stop: nearestStop,
        distance: trackingData.distanceFromStop
      });
    }

    // Send confirmation to sender
    socket.emit('location-updated', vehicleData);
  }

  async handleStatusUpdate(data, socket) {
    const { vehicleId, status } = data;

    if (!vehicleId || !status) {
      socket.emit('error', { message: 'Invalid status data' });
      return;
    }

    const validStatuses = ['active', 'inactive', 'maintenance', 'offline'];
    if (!validStatuses.includes(status)) {
      socket.emit('error', { message: 'Invalid status value' });
      return;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { status },
      { new: true }
    ).populate('route', 'name number');

    if (!vehicle) {
      socket.emit('error', { message: 'Vehicle not found' });
      return;
    }

    // Broadcast status update
    this.io.to(`route-${vehicle.route._id}`).emit('vehicle-status-update', {
      id: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      status: vehicle.status,
      lastUpdated: new Date()
    });

    socket.emit('status-updated', { vehicleId, status });
  }

  async handleOccupancyUpdate(data, socket) {
    const { vehicleId, occupancy } = data;

    if (!vehicleId || typeof occupancy !== 'number') {
      socket.emit('error', { message: 'Invalid occupancy data' });
      return;
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      socket.emit('error', { message: 'Vehicle not found' });
      return;
    }

    if (occupancy < 0 || occupancy > vehicle.capacity) {
      socket.emit('error', { message: 'Invalid occupancy value' });
      return;
    }

    vehicle.occupancy = occupancy;
    vehicle.lastUpdated = new Date();
    await vehicle.save();

    // Broadcast occupancy update
    this.io.to(`route-${vehicle.route}`).emit('vehicle-occupancy-update', {
      id: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      occupancy: vehicle.occupancy,
      capacity: vehicle.capacity,
      lastUpdated: vehicle.lastUpdated
    });

    socket.emit('occupancy-updated', { vehicleId, occupancy });
  }

  async sendRouteVehicles(socket, routeId) {
    try {
      const vehicles = await Vehicle.find({
        route: routeId,
        status: 'active',
        isActive: true
      })
        .populate('route', 'name number color')
        .populate('currentStop nextStop', 'name location');

      const vehiclePositions = vehicles.map(vehicle => ({
        id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        location: vehicle.currentLocation,
        speed: vehicle.speed,
        heading: vehicle.heading,
        occupancy: vehicle.occupancy,
        status: vehicle.status,
        lastUpdated: vehicle.lastUpdated,
        route: vehicle.route,
        currentStop: vehicle.currentStop,
        nextStop: vehicle.nextStop,
        direction: vehicle.direction
      }));

      socket.emit('route-vehicles', vehiclePositions);
    } catch (error) {
      socket.emit('error', { message: 'Failed to fetch route vehicles', error: error.message });
    }
  }

  // Broadcast vehicle location to all connected clients
  broadcastVehicleLocation(vehicleData) {
    this.io.emit('vehicle-location-update', vehicleData);
  }

  // Broadcast to specific route
  broadcastToRoute(routeId, event, data) {
    this.io.to(`route-${routeId}`).emit(event, data);
  }

  // Broadcast to specific stop
  broadcastToStop(stopId, event, data) {
    this.io.to(`stop-${stopId}`).emit(event, data);
  }

  // Broadcast to specific vehicle
  broadcastToVehicle(vehicleId, event, data) {
    this.io.to(`vehicle-${vehicleId}`).emit(event, data);
  }

  // Helper function to calculate distance between two coordinates
  calculateDistance(coord1, coord2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1[1] * Math.PI / 180;
    const φ2 = coord2[1] * Math.PI / 180;
    const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180;
    const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}

module.exports = SocketHandler;

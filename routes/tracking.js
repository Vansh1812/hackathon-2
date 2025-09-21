const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const TrackingData = require('../models/TrackingData');
const Stop = require('../models/Stop');
const Joi = require('joi');

// Validation schema for real-time location updates
const locationUpdateSchema = Joi.object({
  vehicleId: Joi.string().required(),
  coordinates: Joi.array().items(Joi.number()).length(2).required(),
  speed: Joi.number().min(0).default(0),
  heading: Joi.number().min(0).max(360).default(0),
  accuracy: Joi.number().min(0).default(10),
  occupancy: Joi.number().min(0).default(0),
  status: Joi.string().valid('moving', 'stopped', 'boarding', 'alighting').default('moving')
});

// Get real-time vehicle positions for a route
router.get('/route/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { limit = 50 } = req.query;

    const vehicles = await Vehicle.find({
      route: routeId,
      status: 'active',
      isActive: true
    })
      .populate('route', 'name number color')
      .populate('currentStop nextStop', 'name location')
      .limit(parseInt(limit));

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

    res.json({
      success: true,
      data: vehiclePositions,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching real-time positions',
      error: error.message
    });
  }
});

// Get real-time positions for all active vehicles
router.get('/all', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const vehicles = await Vehicle.find({
      status: 'active',
      isActive: true
    })
      .populate('route', 'name number color')
      .populate('currentStop nextStop', 'name location')
      .limit(parseInt(limit));

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

    res.json({
      success: true,
      data: vehiclePositions,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all vehicle positions',
      error: error.message
    });
  }
});

// Get vehicles near a specific location
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, radius = 2000, limit = 20 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const vehicles = await Vehicle.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      },
      status: 'active',
      isActive: true
    })
      .populate('route', 'name number color')
      .populate('currentStop nextStop', 'name location')
      .limit(parseInt(limit));

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
      direction: vehicle.direction,
      distance: vehicle.currentLocation.coordinates ? 
        calculateDistance(
          [parseFloat(lng), parseFloat(lat)],
          vehicle.currentLocation.coordinates
        ) : null
    }));

    res.json({
      success: true,
      data: vehiclePositions,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby vehicles',
      error: error.message
    });
  }
});

// Update vehicle location (for GPS devices/drivers)
router.post('/location', async (req, res) => {
  try {
    const { error, value } = locationUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details
      });
    }

    const vehicle = await Vehicle.findById(value.vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Update vehicle location
    vehicle.currentLocation = {
      type: 'Point',
      coordinates: value.coordinates
    };
    vehicle.speed = value.speed;
    vehicle.heading = value.heading;
    vehicle.occupancy = value.occupancy;
    vehicle.lastUpdated = new Date();

    // Find nearest stop
    const nearestStop = await Stop.findOne({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: value.coordinates
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
      speed: value.speed,
      heading: value.heading,
      accuracy: value.accuracy,
      occupancy: value.occupancy,
      status: value.status,
      stop: nearestStop ? nearestStop._id : null,
      distanceFromStop: nearestStop ? 
        calculateDistance(value.coordinates, nearestStop.location.coordinates) : 0,
      timestamp: new Date()
    });

    await trackingData.save();

    res.json({
      success: true,
      data: {
        vehicle: vehicle._id,
        location: vehicle.currentLocation,
        speed: vehicle.speed,
        heading: vehicle.heading,
        occupancy: vehicle.occupancy,
        currentStop: vehicle.currentStop,
        timestamp: vehicle.lastUpdated
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle location',
      error: error.message
    });
  }
});

// Get tracking history for a vehicle
router.get('/history/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { hours = 24, limit = 200 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const trackingData = await TrackingData.find({
      vehicle: vehicleId,
      timestamp: { $gte: startTime }
    })
      .populate('stop', 'name location')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: trackingData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tracking history',
      error: error.message
    });
  }
});

// Get estimated arrival times for stops on a route
router.get('/eta/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { stopId } = req.query;

    const vehicles = await Vehicle.find({
      route: routeId,
      status: 'active',
      isActive: true
    }).populate('route', 'stops');

    const route = vehicles[0]?.route;
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const etaData = [];

    for (const vehicle of vehicles) {
      const vehicleLocation = vehicle.currentLocation.coordinates;
      if (!vehicleLocation) continue;

      for (const routeStop of route.stops) {
        if (stopId && routeStop.stop.toString() !== stopId) continue;

        const stopLocation = routeStop.stop.location.coordinates;
        const distance = calculateDistance(vehicleLocation, stopLocation);
        const estimatedTime = calculateETA(distance, vehicle.speed);

        etaData.push({
          vehicleId: vehicle._id,
          vehicleNumber: vehicle.vehicleNumber,
          stopId: routeStop.stop,
          stopSequence: routeStop.sequence,
          estimatedArrival: new Date(Date.now() + estimatedTime * 60 * 1000),
          distance: distance,
          speed: vehicle.speed
        });
      }
    }

    res.json({
      success: true,
      data: etaData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating ETA',
      error: error.message
    });
  }
});

// Helper function to calculate distance between two coordinates (in meters)
function calculateDistance(coord1, coord2) {
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

// Helper function to calculate ETA in minutes
function calculateETA(distance, speed) {
  if (speed === 0) return 999; // Very high number if not moving
  return (distance / 1000) / (speed / 60); // Convert to minutes
}

module.exports = router;

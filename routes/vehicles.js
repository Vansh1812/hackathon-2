const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');
const TrackingData = require('../models/TrackingData');
const Joi = require('joi');

// Validation schemas
const vehicleSchema = Joi.object({
  vehicleNumber: Joi.string().required().trim().uppercase(),
  type: Joi.string().valid('bus', 'minibus', 'van', 'trolley').required(),
  capacity: Joi.number().required().min(1).max(200),
  route: Joi.string().required(),
  driver: Joi.object({
    name: Joi.string().required().trim(),
    license: Joi.string().required().trim(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required()
  }).required(),
  currentLocation: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).default([0, 0])
  }).default({ type: 'Point', coordinates: [0, 0] }),
  status: Joi.string().valid('active', 'inactive', 'maintenance', 'offline').default('inactive'),
  direction: Joi.string().valid('forward', 'reverse').default('forward'),
  isActive: Joi.boolean().default(true)
});

const locationUpdateSchema = Joi.object({
  coordinates: Joi.array().items(Joi.number()).length(2).required(),
  speed: Joi.number().min(0).default(0),
  heading: Joi.number().min(0).max(360).default(0),
  accuracy: Joi.number().min(0).default(10),
  occupancy: Joi.number().min(0).default(0),
  status: Joi.string().valid('moving', 'stopped', 'boarding', 'alighting').default('moving')
});

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const { route, status, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (route) {
      query.route = route;
    }

    if (status) {
      query.status = status;
    }

    const vehicles = await Vehicle.find(query)
      .populate('route', 'name number color')
      .populate('currentStop nextStop', 'name location')
      .sort({ vehicleNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vehicle.countDocuments(query);

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles',
      error: error.message
    });
  }
});

// Get vehicles near a location
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, radius = 2000 } = req.query;

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
    }).populate('route', 'name number color')
      .populate('currentStop nextStop', 'name location');

    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby vehicles',
      error: error.message
    });
  }
});

// Get single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('route', 'name number color stops')
      .populate('currentStop nextStop', 'name location address');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle',
      error: error.message
    });
  }
});

// Get vehicle tracking history
router.get('/:id/tracking', async (req, res) => {
  try {
    const { hours = 24, limit = 100 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const trackingData = await TrackingData.find({
      vehicle: req.params.id,
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
      message: 'Error fetching tracking data',
      error: error.message
    });
  }
});

// Create new vehicle
router.post('/', async (req, res) => {
  try {
    const { error, value } = vehicleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details
      });
    }

    // Validate route exists
    const route = await Route.findById(value.route);
    if (!route) {
      return res.status(400).json({
        success: false,
        message: 'Route not found'
      });
    }

    const vehicle = new Vehicle(value);
    await vehicle.save();

    await vehicle.populate('route', 'name number color');

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating vehicle',
      error: error.message
    });
  }
});

// Update vehicle location (for real-time tracking)
router.post('/:id/location', async (req, res) => {
  try {
    const { error, value } = locationUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details
      });
    }

    const vehicle = await Vehicle.findById(req.params.id);
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

// Update vehicle status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'inactive', 'maintenance', 'offline'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('route', 'name number color');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle status',
      error: error.message
    });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = vehicleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details
      });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).populate('route', 'name number color')
     .populate('currentStop nextStop', 'name location');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle',
      error: error.message
    });
  }
});

// Delete vehicle (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { isActive: false, status: 'inactive' },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle',
      error: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Joi = require('joi');

// Validation schemas
const routeSchema = Joi.object({
  name: Joi.string().required().max(100).trim(),
  number: Joi.string().required().trim().uppercase(),
  description: Joi.string().max(500).trim().allow(''),
  stops: Joi.array().items(
    Joi.object({
      stop: Joi.string().required(),
      sequence: Joi.number().required().min(1),
      estimatedTime: Joi.number().default(0)
    })
  ).min(2).required(),
  totalDistance: Joi.number().default(0),
  estimatedDuration: Joi.number().default(0),
  operatingHours: Joi.object({
    start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
  }).required(),
  frequency: Joi.number().required().min(1),
  fare: Joi.number().required().min(0),
  isActive: Joi.boolean().default(true),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#007bff')
});

// Get all routes
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { number: new RegExp(search, 'i') }
      ];
    }

    const routes = await Route.find(query)
      .populate('stops.stop', 'name location address')
      .sort({ number: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Route.countDocuments(query);

    res.json({
      success: true,
      data: routes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching routes',
      error: error.message
    });
  }
});

// Get single route with detailed information
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('stops.stop', 'name location address facilities');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Sort stops by sequence
    route.stops.sort((a, b) => a.sequence - b.sequence);

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route',
      error: error.message
    });
  }
});

// Get route between two stops
router.get('/between/:startStopId/:endStopId', async (req, res) => {
  try {
    const { startStopId, endStopId } = req.params;

    const routes = await Route.find({
      'stops.stop': { $all: [startStopId, endStopId] },
      isActive: true
    }).populate('stops.stop', 'name location address');

    const validRoutes = routes.filter(route => {
      const startIndex = route.stops.findIndex(s => s.stop._id.toString() === startStopId);
      const endIndex = route.stops.findIndex(s => s.stop._id.toString() === endStopId);
      return startIndex !== -1 && endIndex !== -1 && startIndex < endIndex;
    });

    res.json({
      success: true,
      data: validRoutes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding routes between stops',
      error: error.message
    });
  }
});

// Create new route
router.post('/', async (req, res) => {
  try {
    const { error, value } = routeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details
      });
    }

    // Validate that all stops exist
    const stopIds = value.stops.map(s => s.stop);
    const existingStops = await Stop.find({ _id: { $in: stopIds }, isActive: true });
    
    if (existingStops.length !== stopIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more stops not found or inactive'
      });
    }

    const route = new Route(value);
    await route.save();

    // Update stops to include this route
    await Stop.updateMany(
      { _id: { $in: stopIds } },
      { $addToSet: { routes: route._id } }
    );

    await route.populate('stops.stop', 'name location address');

    res.status(201).json({
      success: true,
      data: route
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Route number already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating route',
      error: error.message
    });
  }
});

// Update route
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = routeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details
      });
    }

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).populate('stops.stop', 'name location address');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating route',
      error: error.message
    });
  }
});

// Delete route (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Remove route from stops
    await Stop.updateMany(
      { routes: route._id },
      { $pull: { routes: route._id } }
    );

    res.json({
      success: true,
      message: 'Route deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting route',
      error: error.message
    });
  }
});

module.exports = router;

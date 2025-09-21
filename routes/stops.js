const express = require('express');
const router = express.Router();
const Stop = require('../models/Stop');
const Joi = require('joi');

// Validation schemas
const stopSchema = Joi.object({
  name: Joi.string().required().max(100).trim(),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).required()
  }).required(),
  address: Joi.string().required().trim(),
  city: Joi.string().required().trim(),
  facilities: Joi.array().items(
    Joi.string().valid('shelter', 'bench', 'lighting', 'accessibility', 'ticket_booth', 'wifi')
  ).default([]),
  isActive: Joi.boolean().default(true)
});

// Get all stops
router.get('/', async (req, res) => {
  try {
    const { city, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (search) {
      query.$text = { $search: search };
    }

    const stops = await Stop.find(query)
      .populate('routes', 'name number')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Stop.countDocuments(query);

    res.json({
      success: true,
      data: stops,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stops',
      error: error.message
    });
  }
});

// Get stops near a location
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, radius = 1000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const stops = await Stop.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      },
      isActive: true
    }).populate('routes', 'name number color');

    res.json({
      success: true,
      data: stops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby stops',
      error: error.message
    });
  }
});

// Get single stop
router.get('/:id', async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id)
      .populate('routes', 'name number color frequency fare');

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    res.json({
      success: true,
      data: stop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stop',
      error: error.message
    });
  }
});

// Create new stop
router.post('/', async (req, res) => {
  try {
    const { error, value } = stopSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details
      });
    }

    const stop = new Stop(value);
    await stop.save();

    res.status(201).json({
      success: true,
      data: stop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating stop',
      error: error.message
    });
  }
});

// Update stop
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = stopSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details
      });
    }

    const stop = await Stop.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    res.json({
      success: true,
      data: stop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating stop',
      error: error.message
    });
  }
});

// Delete stop (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const stop = await Stop.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    res.json({
      success: true,
      message: 'Stop deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting stop',
      error: error.message
    });
  }
});

module.exports = router;

const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    req.validatedData = value;
    next();
  };
};

// Validation schemas
const schemas = {
  stop: Joi.object({
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
  }),

  route: Joi.object({
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
  }),

  vehicle: Joi.object({
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
  }),

  locationUpdate: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
    speed: Joi.number().min(0).default(0),
    heading: Joi.number().min(0).max(360).default(0),
    accuracy: Joi.number().min(0).default(10),
    occupancy: Joi.number().min(0).default(0),
    status: Joi.string().valid('moving', 'stopped', 'boarding', 'alighting').default('moving')
  }),

  user: Joi.object({
    username: Joi.string().required().min(3).max(30).trim(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    role: Joi.string().valid('admin', 'driver', 'user').default('user')
  })
};

module.exports = {
  validate,
  schemas
};

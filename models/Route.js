const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    maxlength: [100, 'Route name cannot exceed 100 characters']
  },
  number: {
    type: String,
    required: [true, 'Route number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  stops: [{
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: true
    },
    sequence: {
      type: Number,
      required: true,
      min: 1
    },
    estimatedTime: {
      type: Number, // in minutes from start
      default: 0
    }
  }],
  totalDistance: {
    type: Number, // in kilometers
    default: 0
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  },
  operatingHours: {
    start: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    end: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  frequency: {
    type: Number, // minutes between buses
    required: true,
    min: 1
  },
  fare: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#007bff',
    match: /^#[0-9A-F]{6}$/i
  }
}, {
  timestamps: true
});

// Ensure unique sequence numbers within a route
routeSchema.index({ 'stops.sequence': 1, _id: 1 }, { unique: true });

module.exports = mongoose.model('Route', routeSchema);

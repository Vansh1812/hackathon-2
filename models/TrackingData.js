const mongoose = require('mongoose');

const trackingDataSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  speed: {
    type: Number, // km/h
    default: 0
  },
  heading: {
    type: Number, // degrees (0-360)
    default: 0
  },
  accuracy: {
    type: Number, // meters
    default: 10
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  stop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop'
  },
  distanceFromStop: {
    type: Number, // meters
    default: 0
  },
  estimatedArrival: {
    type: Date
  },
  occupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['moving', 'stopped', 'boarding', 'alighting'],
    default: 'moving'
  }
}, {
  timestamps: true
});

// Create compound indexes for efficient queries
trackingDataSchema.index({ vehicle: 1, timestamp: -1 });
trackingDataSchema.index({ route: 1, timestamp: -1 });
trackingDataSchema.index({ location: '2dsphere' });
trackingDataSchema.index({ timestamp: -1 });

// TTL index to automatically delete old tracking data (keep for 30 days)
trackingDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('TrackingData', trackingDataSchema);

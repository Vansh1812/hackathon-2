const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['bus', 'minibus', 'van', 'trolley']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1,
    max: 200
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  driver: {
    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true
    },
    license: {
      type: String,
      required: [true, 'Driver license is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Driver phone is required'],
      match: /^\+?[\d\s\-\(\)]+$/
    }
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'offline'],
    default: 'inactive'
  },
  currentStop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop'
  },
  nextStop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop'
  },
  direction: {
    type: String,
    enum: ['forward', 'reverse'],
    default: 'forward'
  },
  speed: {
    type: Number, // km/h
    default: 0
  },
  heading: {
    type: Number, // degrees (0-360)
    default: 0
  },
  occupancy: {
    type: Number,
    default: 0,
    min: 0,
    max: function() { return this.capacity; }
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
vehicleSchema.index({ currentLocation: '2dsphere' });
vehicleSchema.index({ vehicleNumber: 1 });
vehicleSchema.index({ route: 1, status: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);

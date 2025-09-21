const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Stop name is required'],
    trim: true,
    maxlength: [100, 'Stop name cannot exceed 100 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  facilities: [{
    type: String,
    enum: ['shelter', 'bench', 'lighting', 'accessibility', 'ticket_booth', 'wifi']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  routes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  }]
}, {
  timestamps: true
});

// Create geospatial index for location queries
stopSchema.index({ location: '2dsphere' });

// Create text index for search functionality
stopSchema.index({ name: 'text', address: 'text', city: 'text' });

module.exports = mongoose.model('Stop', stopSchema);

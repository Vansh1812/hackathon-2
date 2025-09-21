const mongoose = require('mongoose');
const Stop = require('../models/Stop');
const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');

// Sample data for seeding the database
const sampleStops = [
  {
    name: "Central Station",
    location: {
      type: "Point",
      coordinates: [-74.0059, 40.7128] // New York City coordinates
    },
    address: "123 Main Street",
    city: "New York",
    facilities: ["shelter", "bench", "lighting", "accessibility", "ticket_booth"]
  },
  {
    name: "University Campus",
    location: {
      type: "Point",
      coordinates: [-74.0060, 40.7129]
    },
    address: "456 College Avenue",
    city: "New York",
    facilities: ["shelter", "bench", "lighting", "wifi"]
  },
  {
    name: "Shopping Mall",
    location: {
      type: "Point",
      coordinates: [-74.0058, 40.7127]
    },
    address: "789 Commerce Street",
    city: "New York",
    facilities: ["shelter", "bench", "lighting", "accessibility"]
  },
  {
    name: "Hospital",
    location: {
      type: "Point",
      coordinates: [-74.0061, 40.7130]
    },
    address: "321 Health Drive",
    city: "New York",
    facilities: ["shelter", "bench", "lighting", "accessibility"]
  },
  {
    name: "Airport Terminal",
    location: {
      type: "Point",
      coordinates: [-74.0057, 40.7126]
    },
    address: "654 Aviation Boulevard",
    city: "New York",
    facilities: ["shelter", "bench", "lighting", "accessibility", "ticket_booth", "wifi"]
  }
];

const sampleRoutes = [
  {
    name: "Downtown Express",
    number: "D1",
    description: "Fast service connecting downtown with major attractions",
    stops: [], // Will be populated after stops are created
    totalDistance: 15.5,
    estimatedDuration: 45,
    operatingHours: {
      start: "06:00",
      end: "22:00"
    },
    frequency: 10,
    fare: 2.50,
    color: "#FF6B6B"
  },
  {
    name: "University Line",
    number: "U2",
    description: "Connects university campus with city center",
    stops: [], // Will be populated after stops are created
    totalDistance: 12.3,
    estimatedDuration: 35,
    operatingHours: {
      start: "05:30",
      end: "23:30"
    },
    frequency: 8,
    fare: 2.00,
    color: "#4ECDC4"
  },
  {
    name: "Airport Shuttle",
    number: "A3",
    description: "Direct service to and from the airport",
    stops: [], // Will be populated after stops are created
    totalDistance: 25.0,
    estimatedDuration: 60,
    operatingHours: {
      start: "04:00",
      end: "24:00"
    },
    frequency: 15,
    fare: 5.00,
    color: "#45B7D1"
  }
];

const sampleVehicles = [
  {
    vehicleNumber: "BUS001",
    type: "bus",
    capacity: 50,
    route: null, // Will be set after routes are created
    driver: {
      name: "John Smith",
      license: "DL123456",
      phone: "+1-555-0101"
    },
    currentLocation: {
      type: "Point",
      coordinates: [-74.0059, 40.7128]
    },
    status: "active"
  },
  {
    vehicleNumber: "BUS002",
    type: "bus",
    capacity: 40,
    route: null, // Will be set after routes are created
    driver: {
      name: "Sarah Johnson",
      license: "DL789012",
      phone: "+1-555-0102"
    },
    currentLocation: {
      type: "Point",
      coordinates: [-74.0060, 40.7129]
    },
    status: "active"
  },
  {
    vehicleNumber: "VAN003",
    type: "van",
    capacity: 15,
    route: null, // Will be set after routes are created
    driver: {
      name: "Mike Wilson",
      license: "DL345678",
      phone: "+1-555-0103"
    },
    currentLocation: {
      type: "Point",
      coordinates: [-74.0058, 40.7127]
    },
    status: "active"
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Stop.deleteMany({});
    await Route.deleteMany({});
    await Vehicle.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create stops
    const createdStops = await Stop.insertMany(sampleStops);
    console.log(`✅ Created ${createdStops.length} stops`);

    // Create routes with stop references
    const routesWithStops = sampleRoutes.map((route, index) => {
      const routeStops = createdStops.map((stop, stopIndex) => ({
        stop: stop._id,
        sequence: stopIndex + 1,
        estimatedTime: stopIndex * 10 // 10 minutes between stops
      }));

      return {
        ...route,
        stops: routeStops
      };
    });

    const createdRoutes = await Route.insertMany(routesWithStops);
    console.log(`✅ Created ${createdRoutes.length} routes`);

    // Update stops with route references
    for (let i = 0; i < createdStops.length; i++) {
      const stop = createdStops[i];
      const routesForStop = createdRoutes.filter(route => 
        route.stops.some(routeStop => routeStop.stop.toString() === stop._id.toString())
      );
      
      await Stop.findByIdAndUpdate(stop._id, {
        routes: routesForStop.map(route => route._id)
      });
    }

    // Create vehicles with route references
    const vehiclesWithRoutes = sampleVehicles.map((vehicle, index) => ({
      ...vehicle,
      route: createdRoutes[index % createdRoutes.length]._id
    }));

    const createdVehicles = await Vehicle.insertMany(vehiclesWithRoutes);
    console.log(`✅ Created ${createdVehicles.length} vehicles`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Stops: ${createdStops.length}`);
    console.log(`   - Routes: ${createdRoutes.length}`);
    console.log(`   - Vehicles: ${createdVehicles.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/database');
  
  connectDB().then(() => {
    seedDatabase().then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    }).catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
  });
}

module.exports = { seedDatabase, sampleStops, sampleRoutes, sampleVehicles };

# Real-Time Public Transport Tracker Backend

A comprehensive backend system for real-time public transport tracking in small cities, built with Express.js and MongoDB.

## 🚀 Features

- **Real-time Vehicle Tracking**: Live GPS location updates with WebSocket support
- **Route Management**: Complete CRUD operations for bus routes and stops
- **Vehicle Management**: Track buses, drivers, and vehicle status
- **Geospatial Queries**: Find nearby stops and vehicles using MongoDB geospatial features
- **ETA Calculations**: Estimate arrival times based on current location and speed
- **Occupancy Tracking**: Monitor passenger capacity in real-time
- **RESTful API**: Well-structured API endpoints with validation
- **WebSocket Support**: Real-time updates for live tracking
- **Security**: Rate limiting, CORS, and input validation

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for WebSocket connections
- **Validation**: Joi for request validation
- **Security**: Helmet, CORS, Rate limiting
- **Environment**: dotenv for configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd public-transport-tracker-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/transport_tracker
   JWT_SECRET=your_super_secret_jwt_key_here
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Stops
- `GET /api/v1/stops` - Get all stops
- `GET /api/v1/stops/nearby` - Get stops near a location
- `GET /api/v1/stops/:id` - Get single stop
- `POST /api/v1/stops` - Create new stop
- `PUT /api/v1/stops/:id` - Update stop
- `DELETE /api/v1/stops/:id` - Delete stop

### Routes
- `GET /api/v1/routes` - Get all routes
- `GET /api/v1/routes/:id` - Get single route
- `GET /api/v1/routes/between/:startStopId/:endStopId` - Find routes between stops
- `POST /api/v1/routes` - Create new route
- `PUT /api/v1/routes/:id` - Update route
- `DELETE /api/v1/routes/:id` - Delete route

### Vehicles
- `GET /api/v1/vehicles` - Get all vehicles
- `GET /api/v1/vehicles/nearby` - Get vehicles near a location
- `GET /api/v1/vehicles/:id` - Get single vehicle
- `GET /api/v1/vehicles/:id/tracking` - Get vehicle tracking history
- `POST /api/v1/vehicles` - Create new vehicle
- `POST /api/v1/vehicles/:id/location` - Update vehicle location
- `PUT /api/v1/vehicles/:id/status` - Update vehicle status
- `PUT /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Delete vehicle

### Real-time Tracking
- `GET /api/v1/tracking/route/:routeId` - Get real-time positions for route
- `GET /api/v1/tracking/all` - Get all active vehicle positions
- `GET /api/v1/tracking/nearby` - Get vehicles near location
- `POST /api/v1/tracking/location` - Update vehicle location
- `GET /api/v1/tracking/history/:vehicleId` - Get tracking history
- `GET /api/v1/tracking/eta/:routeId` - Get estimated arrival times

## 🔌 WebSocket Events

### Client to Server
- `join-route` - Join route-specific room
- `join-stop` - Join stop-specific room
- `join-vehicle` - Join vehicle-specific room
- `location-update` - Send location update
- `status-update` - Send status update
- `occupancy-update` - Send occupancy update

### Server to Client
- `vehicle-location-update` - Real-time location update
- `vehicle-status-update` - Vehicle status change
- `vehicle-occupancy-update` - Occupancy change
- `vehicle-arrival` - Vehicle arriving at stop
- `route-vehicles` - Current vehicles on route
- `error` - Error messages

## 📊 Database Models

### Stop
- Location (geospatial)
- Name, address, city
- Facilities (shelter, bench, etc.)
- Associated routes

### Route
- Name, number, description
- Ordered stops with sequences
- Operating hours and frequency
- Fare and color coding

### Vehicle
- Vehicle number and type
- Driver information
- Current location and status
- Route assignment
- Occupancy tracking

### TrackingData
- Historical location data
- Speed, heading, accuracy
- Timestamp and status
- TTL index (30 days)

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Example Usage

### Create a Stop
```bash
curl -X POST http://localhost:5000/api/v1/stops \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Central Station",
    "location": {
      "type": "Point",
      "coordinates": [-74.0059, 40.7128]
    },
    "address": "123 Main Street",
    "city": "New York",
    "facilities": ["shelter", "bench", "lighting"]
  }'
```

### Update Vehicle Location
```bash
curl -X POST http://localhost:5000/api/v1/tracking/location \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "vehicle_id_here",
    "coordinates": [-74.0059, 40.7128],
    "speed": 25,
    "heading": 90,
    "occupancy": 15
  }'
```

### WebSocket Connection
```javascript
const socket = io('http://localhost:5000');

// Join a route for real-time updates
socket.emit('join-route', 'route_id_here');

// Listen for vehicle updates
socket.on('vehicle-location-update', (data) => {
  console.log('Vehicle location:', data);
});
```

## 🔧 Configuration

The application uses environment variables for configuration. Key settings:

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Allowed CORS origins
- `RATE_LIMIT_MAX_REQUESTS`: Rate limiting threshold

## 🚀 Deployment

1. **Production Environment**
   ```bash
   NODE_ENV=production npm start
   ```

2. **Docker Deployment**
   ```bash
   docker build -t transport-tracker .
   docker run -p 5000:5000 transport-tracker
   ```

3. **Environment Variables**
   - Set production MongoDB URI
   - Configure JWT secret
   - Set appropriate CORS origins
   - Configure rate limiting

## 📈 Performance Considerations

- **Geospatial Indexes**: Optimized for location-based queries
- **TTL Indexes**: Automatic cleanup of old tracking data
- **Rate Limiting**: Prevents API abuse
- **Connection Pooling**: Efficient database connections
- **WebSocket Rooms**: Targeted real-time updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the example usage

---

**Built with ❤️ for better public transportation in small cities**

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const config = require('./config/config');
const SocketHandler = require('./socket/socketHandler');

// Import routes
const stopsRoutes = require('./routes/stops');
const routesRoutes = require('./routes/routes');
const vehiclesRoutes = require('./routes/vehicles');
const trackingRoutes = require('./routes/tracking');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"]
  }
});

// Initialize socket handler
new SocketHandler(io);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Transport Tracker API is running',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// API routes
app.use(`/api/${config.apiVersion}/stops`, stopsRoutes);
app.use(`/api/${config.apiVersion}/routes`, routesRoutes);
app.use(`/api/${config.apiVersion}/vehicles`, vehiclesRoutes);
app.use(`/api/${config.apiVersion}/tracking`, trackingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Real-Time Public Transport Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      stops: `/api/${config.apiVersion}/stops`,
      routes: `/api/${config.apiVersion}/routes`,
      vehicles: `/api/${config.apiVersion}/vehicles`,
      tracking: `/api/${config.apiVersion}/tracking`
    },
    websocket: 'Available at /socket.io/'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚌 Transport Tracker API running on port ${PORT}`);
  console.log(`🌐 Environment: ${config.nodeEnv}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/${config.apiVersion}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };

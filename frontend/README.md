# Transport Tracker Frontend

A modern React frontend for the Real-Time Public Transport Tracker system.

## 🚀 Features

- **Real-time Map View**: Interactive map with live vehicle tracking
- **Dashboard**: Overview of routes, vehicles, and system statistics
- **Route Management**: View and manage bus routes
- **Stop Management**: Browse and filter bus stops
- **WebSocket Integration**: Real-time updates for live tracking
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful interface with smooth animations

## 🛠️ Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Leaflet**: Interactive maps
- **Socket.IO Client**: Real-time communication
- **Framer Motion**: Smooth animations
- **Lucide React**: Beautiful icons
- **Axios**: HTTP client
- **React Hot Toast**: Notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.jsx      # Navigation header
│   │   ├── VehicleCard.jsx # Vehicle display card
│   │   ├── RouteCard.jsx   # Route display card
│   │   ├── StatsCard.jsx   # Statistics card
│   │   ├── MapControls.jsx # Map control panel
│   │   └── ...
│   ├── pages/              # Main application pages
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── MapView.jsx     # Interactive map
│   │   ├── RoutesPage.jsx  # Routes management
│   │   └── StopsPage.jsx   # Stops management
│   ├── context/            # React context providers
│   │   ├── SocketContext.jsx # WebSocket management
│   │   └── DataContext.jsx   # Data management
│   ├── services/           # API services
│   │   └── api.js         # HTTP client configuration
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```

## 🎨 UI Components

### Dashboard
- System statistics overview
- Recent vehicle activity
- Route overview
- Quick action buttons

### Map View
- Interactive map with Leaflet
- Real-time vehicle markers
- Stop markers with popups
- Route polylines
- Map controls panel

### Routes Page
- Grid view of all routes
- Search and filter functionality
- Route statistics
- Route details and management

### Stops Page
- Grid view of all stops
- Advanced filtering options
- Stop facilities display
- Route connections

## 🔌 WebSocket Events

### Client to Server
- `join-route`: Subscribe to route updates
- `join-stop`: Subscribe to stop updates
- `join-vehicle`: Subscribe to vehicle updates

### Server to Client
- `vehicle-location-update`: Real-time location updates
- `vehicle-status-update`: Vehicle status changes
- `vehicle-arrival`: Vehicle arriving at stop
- `route-vehicles`: Current vehicles on route

## 🎯 Key Features

### Real-time Tracking
- Live vehicle positions on map
- Vehicle status and occupancy
- Speed and heading information
- Last update timestamps

### Interactive Map
- Zoom and pan controls
- Layer toggles (routes, stops)
- Route selection
- Vehicle information popups

### Responsive Design
- Mobile-friendly interface
- Touch-friendly controls
- Adaptive layouts
- Optimized for all screen sizes

## 🚀 Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🧪 Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔧 Configuration

The app connects to the backend API at `http://localhost:5000` by default. This can be configured in `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend URL
        changeOrigin: true,
      },
    },
  },
})
```

## 📱 Mobile Support

The frontend is fully responsive and works great on mobile devices:
- Touch-friendly map controls
- Swipe gestures for navigation
- Optimized layouts for small screens
- Fast loading and smooth animations

## 🎨 Styling

The app uses CSS custom properties for theming:
- Consistent color palette
- Responsive typography
- Smooth animations
- Modern design system

## 🔗 Integration

The frontend integrates with the backend through:
- REST API endpoints for data fetching
- WebSocket connections for real-time updates
- Shared data models and types
- Consistent error handling

---

**Built with ❤️ for better public transportation tracking**

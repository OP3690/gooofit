const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
// More robust CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
            const allowedOrigins = [
        'https://gooofit.com',
        'https://www.gooofit.com',
        'https://weight-loss-lac.vercel.app',
        'https://client-9jm305kpo-omprakash-utahas-projects.vercel.app',
        'https://weight-management-frontend.vercel.app',
        'https://weight-management-client.vercel.app',
          'http://localhost:3000',
          'http://localhost:3002',
          'http://localhost:3003'
        ];
    
    console.log('CORS request from origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://global5665:test123@cluster0.wigbba7.mongodb.net/weight-management?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const userRoutes = require('./routes/users');
const weightEntryRoutes = require('./routes/weightEntries');
const careersRoutes = require('./routes/careers');
const userSuccessRoutes = require('./routes/userSuccess');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/weight-entries', weightEntryRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/user-success', userSuccessRoutes);
app.use('/api/meals', require('./routes/meals'));

// Import ping service
const PingService = require('./services/pingService');

// Health check endpoint for ping service
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'weight-management-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Email test endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const { testEmailService } = require('./services/emailService');
    const result = await testEmailService();
    res.json({
      success: result.success,
      message: result.message,
      api: result.api,
      smtp: result.smtp
    });
  } catch (error) {
    console.error('❌ Email service test error:', error);
    res.status(500).json({
      success: false,
      message: 'Email service test failed',
      error: error.message
    });
  }
});

// GoDaddy SMTP test endpoint
app.get('/api/test-smtp', async (req, res) => {
  try {
    console.log('🧪 Testing GoDaddy SMTP...');
    
    const { testEmailService } = require('./services/emailService');
    const result = await testEmailService();
    
    console.log('📊 GoDaddy SMTP test result:', result);
    
    res.json({
      success: result.success,
      message: result.message,
      smtp: result.smtp
    });
    
  } catch (error) {
    console.error('❌ GoDaddy SMTP test error:', error);
    res.status(500).json({
      success: false,
      message: 'GoDaddy SMTP test failed',
      error: error.message
    });
  }
});

// Serve static assets in production (only for non-API routes)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('MongoDB connected successfully');
  console.log("🚀 Server started and latest code is running - " + new Date().toISOString());
  
  // Start ping service to keep server awake on Render free tier
  if (process.env.NODE_ENV === 'production') {
    const pingService = new PingService();
    pingService.start();
    
    // Log ping service status
    console.log('🔧 Ping service status:', pingService.getStatus());
  }
}); 
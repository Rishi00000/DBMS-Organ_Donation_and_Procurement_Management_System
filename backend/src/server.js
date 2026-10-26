import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import database
import pool from './config/database.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import hospitalRegisterRoutes from './routes/hospital.register.routes.js';
import donorRoutes from './routes/donor.routes.js';
import recipientRoutes from './routes/recipient.routes.js';
import organRoutes from './routes/organ.routes.js';
import matchRoutes from './routes/match.routes.js';
import transplantRoutes from './routes/transplant.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARE
// =====================================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('dev'));
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// =====================================================
// ROUTES
// =====================================================

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message,
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
// Mount public hospital registration routes FIRST (before protected routes)
app.use('/api/hospitals', hospitalRegisterRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/recipients', recipientRoutes);
app.use('/api/organs', organRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/transplants', transplantRoutes);
app.use('/api/admin', adminRoutes);

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    message: 'ODPMS API - Organ Donation and Procurement Management System',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      hospitals: '/api/hospitals',
      donors: '/api/donors',
      recipients: '/api/recipients',
      organs: '/api/organs',
      matches: '/api/matches',
      transplants: '/api/transplants',
      admin: '/api/admin',
    },
    documentation: 'Visit /api/docs for full API documentation',
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// =====================================================
// SERVER START
// =====================================================

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║   🏥  ODPMS - Organ Donation & Procurement System  🏥    ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📝 Available Endpoints:');
  console.log('   - POST   /api/auth/login');
  console.log('   - POST   /api/auth/register');
  console.log('   - GET    /api/hospitals');
  console.log('   - GET    /api/donors');
  console.log('   - GET    /api/recipients');
  console.log('   - GET    /api/organs');
  console.log('   - GET    /api/matches');
  console.log('   - GET    /api/transplants');
  console.log('   - GET    /api/admin/dashboard');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

export default app;

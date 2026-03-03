import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import { validateApiKey } from './middleware/apiKey.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';
import classRoutes from './routes/classRoutes.js';
import classStatsRoutes from './routes/classStatsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import testRoutes from './routes/testRoutes.js';

const app: Application = express();

// Connect to MongoDB
connectDB();

// Middleware
// Configure helmet with less restrictive CSP for development
if (config.nodeEnv === 'development') {
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP in development to avoid blocking dev tools and extensions
  }));
} else {
  app.use(helmet()); // Use default helmet security headers in production
}

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting - Disabled in development
if (config.nodeEnv === 'production') {
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);
}

// Rate limiter reset endpoint for development
if (config.nodeEnv === 'development') {
  app.post('/api/reset-rate-limit', (req, res) => {
    res.json({ message: 'Rate limiting disabled in development', ip: req.ip });
  });
  
  // Test endpoint to verify server is working
  app.get('/api/test-server', (req, res) => {
    res.json({ 
      message: 'Server is working', 
      timestamp: new Date().toISOString(),
      nodeEnv: config.nodeEnv,
      rateLimitingEnabled: false
    });
  });
}

// API Key validation for all routes except health check and test routes
app.use('/api', (req, res, next) => {
  // Skip API key validation for test routes during development
  if (req.path.startsWith('/test/')) {
    console.log('Bypassing API key validation for test route:', req.path);
    return next();
  }
  return validateApiKey(req, res, next);
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test routes (no middleware applied)
app.use('/test', testRoutes);

console.log('Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/guardians', guardianRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/class_stat', classStatsRoutes);
app.use('/api/calender', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api', templateRoutes);
app.use('/api', resultRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/chat', chatRoutes);
console.log('Routes registered successfully');

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
});

export default app;

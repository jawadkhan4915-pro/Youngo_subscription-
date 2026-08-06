import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import hpp from 'hpp';
import { rateLimit } from 'express-rate-limit';

import connectDB from './config/db.js';
import seedDatabase from './utils/seeder.js';
import { errorHandler } from './middlewares/error.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import toolRoutes from './routes/toolRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import usageRoutes from './routes/usageRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import userAdminRoutes from './routes/userAdminRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => {
  // Run seeder to setup default admin and tools
  seedDatabase();
});

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// HTTP Parameter Pollution protection
app.use(hpp());

// Security headers with cross-origin resource support
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);

// Compress response payloads
app.use(compression());

// Setup Strict CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Cross-Origin Request Blocked by Security Policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

// Global API Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  message: {
    success: false,
    error: 'Too many requests from this IP address, please try again in 15 minutes.'
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

// Dedicated Auth Limiter (Brute-force protection for sensitive auth paths)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

// Dedicated AI Prompt Execution Limiter
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  message: {
    success: false,
    error: 'AI prompt execution limit reached. Please wait a minute before sending more requests.'
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

// Mount dedicated rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/verify-email', authLimiter);
app.use('/api/auth/forgotpassword', authLimiter);
app.use('/api/auth/resetpassword', authLimiter);
app.use('/api/usage/execute', aiLimiter);
app.use('/api/', apiLimiter);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users-admin', userAdminRoutes);

// Base route for status health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Youngo Subscription API is healthy & running!' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
// Nodemon trigger reload comment v2


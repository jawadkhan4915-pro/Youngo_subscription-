import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './error.js';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Get token from cookies or Authorization header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    res.status(401);
    throw new Error('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'youngo_jwt_access_secret_token_99382!');

    // Get user and attach to request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      res.status(401);
      throw new Error('User not found with this token');
    }

    if (req.user.status === 'Suspended' || req.user.status === 'Banned') {
      res.status(403);
      throw new Error(`Your account has been ${req.user.status.toLowerCase()}`);
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized to access this route');
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role '${req.user?.role}' is not authorized to access this route`);
    }
    next();
  };
};

// Optional protect middleware (doesn't throw error if token is missing/invalid)
export const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'youngo_jwt_access_secret_token_99382!');
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Quietly ignore invalid/expired tokens for optional paths
    }
  }
  next();
});

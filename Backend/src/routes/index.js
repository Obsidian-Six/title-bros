/**
 * ==============================================================================
 * Master API v1 Router Aggregator
 * ==============================================================================
 * Central routing gateway that mounts all sub-modules under the /api/v1 prefix:
 * - /api/v1/auth   -> Authentication and session endpoints
 * - /api/v1/users  -> User, staff, and customer management endpoints
 * - /api/v1/health -> Healthcheck & uptime monitoring
 */

import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import loanRoutes from './loanRoutes.js';
import customerRoutes from './customerRoutes.js';
import communicationRoutes from './communicationRoutes.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

// Health check endpoint for uptime monitors and load balancers
router.get('/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
      },
      'Title Bros API is operational'
    )
  );
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/loans', loanRoutes);
router.use('/customers', customerRoutes);
router.use('/communications', communicationRoutes);

export default router;

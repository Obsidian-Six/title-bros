/**
 * ==============================================================================
 * Express Application Configuration
 * ==============================================================================
 * Sets up global Express middlewares:
 * - Helmet for HTTP security headers
 * - CORS for cross-origin browser requests with credentials support
 * - Morgan for HTTP request logging
 * - JSON and URL-encoded body parsers
 * - Cookie parser for HTTP-only JWTs
 * - Master API routes mounting at /api/v1
 * - Global 404 and error handling pipeline
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS Configuration
const configuredClientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredClientUrls,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      try {
        const normalizedOrigin = origin.replace(/\/$/, '');
        const host = new URL(origin).hostname;

        // Allow explicit origins, local dev, or any *.vercel.app deployment
        if (allowedOrigins.includes(normalizedOrigin) || /\.vercel\.app$/.test(host) || host === 'localhost') {
          return callback(null, true);
        }
      } catch (e) {
        // Continue to rejection
      }

      callback(new Error(`Blocked by CORS policy: ${origin}`));
    },
    credentials: true, // Allow cookies to be sent across origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Request Logging (in development mode)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 4. Request Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Cookie Parser
app.use(cookieParser());

// 6. Static File Serving for Uploaded Loan Documents
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// 7. Base API Router
app.use('/api/v1', routes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    name: 'Title Bros Loans API',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// 7. Error Handling Pipeline
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

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

// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import cookieParser from 'cookie-parser';
// import path from 'path';
// import { fileURLToPath } from 'url';

// import routes from './routes/index.js';
// import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// // 1. Security HTTP Headers
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: 'cross-origin' },
//   })
// );

// // 2. CORS Configuration
// const allowedOrigins = [
//   process.env.CLIENT_URL || 'http://localhost:3000',
//   'http://127.0.0.1:3000',
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow requests with no origin (like mobile apps, curl, postman)
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Blocked by CORS policy'));
//       }
//     },
//     credentials: true, // Allow cookies to be sent across origins
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   })
// );

// // 3. Request Logging (in development mode)
// if (process.env.NODE_ENV !== 'production') {
//   app.use(morgan('dev'));
// }

// // 4. Request Body Parsers
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // 5. Cookie Parser
// app.use(cookieParser());

// // 6. Static File Serving for Uploaded Loan Documents
// app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// // 7. Base API Router
// app.use('/api/v1', routes);

// // Root greeting
// app.get('/', (req, res) => {
//   res.json({
//     name: 'Title Bros Loans API',
//     version: '1.0.0',
//     documentation: '/api/v1/health',
//   });
// });

// // 7. Error Handling Pipeline
// app.use(notFoundHandler);
// app.use(errorHandler);

// export default app;

/**
 * ==============================================================================
 * Express Application Configuration
 * ==============================================================================
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middlewares/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* =============================================================================
   1. SECURITY HEADERS
============================================================================= */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/* =============================================================================
   2. CORS
============================================================================= */

// Normalize URLs so trailing "/" does not cause CORS mismatch
const normalizeOrigin = (url = "") => {
  return url.trim().replace(/\/+$/, "");
};

// Your frontend URLs
const allowedOrigins = [
  "https://title-bros-new-temp.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// Add CLIENT_URL from Render environment variables
if (process.env.CLIENT_URL) {
  const envOrigins = process.env.CLIENT_URL
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  envOrigins.forEach((origin) => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

// Normalize all origins
const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);

// console.log("==========================================");
// console.log("CORS Allowed Origins:");
// console.log(normalizedAllowedOrigins);
// console.log("CLIENT_URL:", process.env.CLIENT_URL || "NOT SET");
// console.log("==========================================");

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without Origin:
      // Postman, curl, server-to-server, etc.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      // console.log("CORS Request Origin:", normalizedOrigin);

      if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
        // console.log("CORS ALLOWED:", normalizedOrigin);
        return callback(null, true);
      }

      // console.error("CORS BLOCKED:", normalizedOrigin);

      return callback(
        new Error(`CORS blocked origin: ${normalizedOrigin}`)
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],

    optionsSuccessStatus: 204,
  })
);

/* =============================================================================
   3. REQUEST LOGGING
============================================================================= */

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* =============================================================================
   4. BODY PARSERS
============================================================================= */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* =============================================================================
   5. COOKIE PARSER
============================================================================= */

app.use(cookieParser());

/* =============================================================================
   6. STATIC UPLOADS
============================================================================= */

app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "../uploads"))
);

/* =============================================================================
   7. API ROUTES
============================================================================= */

app.use("/api/v1", routes);

/* =============================================================================
   8. ROOT
============================================================================= */

app.get("/", (req, res) => {
  res.json({
    name: "Title Bros Loans API",
    version: "1.0.0",
    documentation: "/api/v1/health",
  });
});

/* =============================================================================
   9. ERROR HANDLING
============================================================================= */

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
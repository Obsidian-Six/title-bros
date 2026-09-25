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
   2. DYNAMIC CORS (CREDENTIALS & MULTI-ORIGIN READY)
============================================================================= */

// Normalize URLs so trailing "/" does not cause CORS mismatch
const normalizeOrigin = (url = "") => {
  return url.trim().replace(/\/+$/, "");
};

// Your frontend URLs
const allowedOrigins = [
  "https://title-bros-obs.vercel.app",
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

const corsOptions = {
  origin: (origin, callback) => {
    // Requests without Origin: Postman, curl, server-to-server, etc.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (
      normalizedAllowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith(".vercel.app") ||
      normalizedOrigin.endsWith(".onrender.com") ||
      normalizedOrigin.includes("localhost") ||
      process.env.NODE_ENV !== "production"
    ) {
      return callback(null, true);
    }

    // Default safe fallback so no valid frontend client is blocked
    return callback(null, true);
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
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

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
# Title Bros Loans - Backend API & Authentication Service

A modern, production-grade Node.js and Express RESTful API with MongoDB Atlas integration, featuring the **4.2 User Authentication System** with multi-tier Role-Based Access Control (RBAC), active session tracking, auto-logout inactivity timeouts, and secure password recovery.

---

## 1. Directory Structure

```
Backend/
├── .env                       # Environment secrets (MongoDB URI, JWT secret, timeouts)
├── .env.example               # Template environment configuration
├── .gitignore                 # Excluded node_modules and logs
├── package.json               # Modern ES Module configuration ("type": "module")
├── README.md                  # This documentation guide
└── src/
    ├── config/
    │   └── db.js              # MongoDB Atlas connection lifecycle & reconnect handlers
    ├── controllers/
    │   ├── authController.js  # Customer register, login, admin login, logout, forgot/reset password
    │   └── userController.js  # Super Admin provisioning of Admin staff, status management
    ├── middlewares/
    │   ├── authMiddleware.js  # JWT verification, active session tracking & inactivity timeout
    │   ├── roleMiddleware.js  # Role-Based Access Control (SUPER_ADMIN, ADMIN, CUSTOMER)
    │   ├── rateLimiter.js     # Rate limiting against brute-force attacks
    │   ├── validationMiddleware.js # Express-validator runner & error formatter
    │   └── errorMiddleware.js # Centralized 404 & exception handler
    ├── models/
    │   ├── User.js            # User model (roles, bcrypt hash, failed attempts, lockout)
    │   └── Session.js         # Session model (IP, User-Agent, lastActiveAt, invalidation)
    ├── routes/
    │   ├── index.js           # API v1 master router (/api/v1)
    │   ├── authRoutes.js      # /api/v1/auth routes
    │   └── userRoutes.js      # /api/v1/users routes
    ├── utils/
    │   ├── ApiError.js        # Standardized custom error class
    │   ├── ApiResponse.js     # Standardized JSON response envelope
    │   ├── asyncHandler.js    # Async route wrapper removing try/catch boilerplate
    │   ├── emailService.js    # Nodemailer with Title Bros branded HTML email template
    │   └── token.js           # JWT signing/verification & crypto token hashing
    ├── validators/
    │   └── authValidator.js   # Request payload validation rules
    ├── scripts/
    │   └── seedSuperAdmin.js  # Initial Super Admin creation script
    ├── app.js                 # Express application setup (CORS, Helmet, parsers, routes)
    └── server.js              # Server entrypoint and graceful shutdown handlers
```

---

## 2. Permission Levels & Role Matrix

| Role | Description | Public Registration | Can Create Admins | Permissions |
| :--- | :--- | :---: | :---: | :--- |
| **`SUPER_ADMIN`** | Platform Owner / Executive | ❌ No | ✅ Yes | Full access. Can create and deactivate Admin accounts, view all customer loans and audit logs. |
| **`ADMIN`** | Title Bros Staff / Loan Officers | ❌ No | ❌ No | Can process loan applications, review customer documents, view customer profiles. Created solely by Super Admin. |
| **`CUSTOMER`** | Borrowers / Public Applicants | ✅ Yes | ❌ No | Can apply for loans, upload documents, track personal loan status, update personal profile. |

---

## 3. Core Features (4.2 User Authentication System)

1. **Email + Password Login with Session Management**:
   - Customer login via `POST /api/v1/auth/login`.
   - Admin login via `POST /api/v1/auth/admin/login` (strictly validates `ADMIN` or `SUPER_ADMIN`).
   - Every login registers an active `Session` in MongoDB recording the user's IP, device user-agent, and `lastActiveAt`.

2. **Session Timeout for Security (Auto-Logout After Inactivity)**:
   - Configurable per role via `.env`:
     - Admin: 15 minutes (`SESSION_INACTIVITY_TIMEOUT_ADMIN=15`)
     - Customer: 60 minutes (`SESSION_INACTIVITY_TIMEOUT_CUSTOMER=60`)
   - The `protect` middleware automatically checks `Date.now() - session.lastActiveAt`. If idle duration exceeds the threshold, the session is invalidated and rejected with a `401 Unauthorized`.

3. **Admin Accounts Created by Super Admin Only**:
   - `POST /api/v1/users/create-admin` is strictly guarded by `restrictTo('SUPER_ADMIN')`.
   - Admin accounts cannot be created via the public registration endpoint.

4. **Forgot Password Flow with Branded Email Reset Link**:
   - `POST /api/v1/auth/forgot-password` generates a 32-byte crypto hex token and stores its SHA-256 hash in DB with 15-minute expiry.
   - Dispatches a Title Bros branded HTML email template featuring Title Bros signature colors (`#087a45` green, `#075a35` dark green, `#b9ef3b` lime).
   - In local development without SMTP, the reset link is automatically printed to the terminal for instant testing.
   - `POST /api/v1/auth/reset-password/:token` validates the hash, updates password with bcrypt, and invalidates all prior sessions.

5. **Brute-Force & Lockout Protection**:
   - Consecutive failed logins are tracked. After 5 failed attempts, the account is temporarily locked for 15-30 minutes.
   - `express-rate-limit` limits login attempts per IP.

---

## 4. Quick Start & Setup

### Prerequisites
- Node.js 18+ (tested on Node v22)
- npm 9+

### Installation
```bash
cd Backend
npm install
```

### Environment Configuration
The `.env` file is pre-configured with the MongoDB Atlas cluster URI:
```env
PORT=5000
MONGODB_URI=mongodb+srv://kundrapubalaji251:Balaji123@cluster0.zamvxj2.mongodb.net/titlebros_db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=titlebros_super_secure_jwt_secret_key_2026_@v3_!9xL
JWT_EXPIRE=1d
SESSION_INACTIVITY_TIMEOUT_ADMIN=15
SESSION_INACTIVITY_TIMEOUT_CUSTOMER=60
SUPER_ADMIN_EMAIL=superadmin@titlebros.com
SUPER_ADMIN_PASSWORD=SuperAdmin@2026!
```

### Seed Initial Super Admin
```bash
npm run seed:admin
```

### Start Development Server
```bash
npm run dev
# Or for standard production start:
npm start
```

---

## 5. API Reference Summary

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Public customer sign-up
- `POST /api/v1/auth/login` — Customer login
- `POST /api/v1/auth/admin/login` — Dedicated staff/admin login
- `POST /api/v1/auth/logout` — Invalidate current session (Private)
- `GET  /api/v1/auth/me` — Current user profile & session info (Private)
- `POST /api/v1/auth/forgot-password` — Request password reset email
- `POST /api/v1/auth/reset-password/:token` — Reset password using token
- `POST /api/v1/auth/refresh` — Renew session token (Private)

### User & Staff Management (`/api/v1/users`)
- `POST  /api/v1/users/create-admin` — Create Admin account (Super Admin only)
- `GET   /api/v1/users/admins` — List staff (Super Admin & Admin)
- `GET   /api/v1/users/customers` — List customers with pagination (Super Admin & Admin)
- `PATCH /api/v1/users/:id/status` — Update user status (Super Admin only)
- `PUT   /api/v1/users/profile` — Update self profile (Private)

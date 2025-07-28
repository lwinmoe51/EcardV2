/**
 * EcardV2 Backend Server
 * Main Express server configuration and setup
 *
 * This file sets up the Express server with middleware, routes, and error handling.
 * It serves as the entry point for the backend API.
 */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import route modules
const authRoutes = require("./routes/auth"); // Authentication routes (signup, login, profile)
const usersRoutes = require("./routes/users"); // User management routes (admin only)

const app = express();

// ===== MIDDLEWARE CONFIGURATION =====

// CORS (Cross-Origin Resource Sharing) configuration
// Allows frontend to make requests to this backend
// TODO: Update origin for production deployment (e.g., your domain)
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true, // Allows cookies and authentication headers
    })
);

// Body parsing middleware
// Limits request body size to 10MB to prevent large file uploads
// TODO: Adjust limit based on your application needs (e.g., image uploads)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
// Logs all incoming requests with timestamp for debugging and monitoring
// TODO: Replace with proper logging library (e.g., Winston, Morgan) for production
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ===== ROUTE REGISTRATION =====

// Mount API routes under /api prefix
// All routes will be accessible at /api/route-name
app.use("/api", authRoutes); // /api/signup, /api/login, /api/profile
app.use("/api", usersRoutes); // /api/users (admin only)

// ===== SYSTEM ENDPOINTS =====

// Health check endpoint for monitoring and load balancers
// Returns server status, timestamp, and environment
// TODO: Add more health checks (database connectivity, external services)
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});

// ===== ERROR HANDLING =====

// 404 handler - catches all unmatched routes
// Returns JSON error instead of HTML for API consistency
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler - catches all unhandled errors
// Logs errors and returns appropriate error responses
// TODO: Add error reporting service (e.g., Sentry) for production
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({
        error: "Internal server error",
        message:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Something went wrong",
    });
});

// ===== SERVER CONFIGURATION =====

const PORT = process.env.PORT || 5000;

// Environment variable validation
// Ensures required variables are set before starting server
if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET environment variable is required");
    process.exit(1);
}

// Supabase credentials warning (non-blocking for development)
// Warns if Supabase is not properly configured
// TODO: Make this blocking for production deployment
if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_URL === "your-supabase-url" ||
    process.env.SUPABASE_SERVICE_ROLE_KEY === "your-supabase-key"
) {
    console.warn("⚠️  WARNING: Supabase credentials not properly configured");
    console.warn(
        "   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file"
    );
    console.warn(
        "   Authentication endpoints will not work without proper Supabase setup"
    );
}

// Start the server
// TODO: Add graceful shutdown handling for production
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
});

/**
 * TODO: FUTURE ENHANCEMENTS
 *
 * 1. DATABASE EXPANSION:
 *    - Add ecards table for storing digital cards
 *    - Add categories table for organizing cards
 *    - Add favorites table for user preferences
 *    - Add sharing table for card sharing functionality
 *
 * 2. DEPLOYMENT CHANGES:
 *    - Update CORS origin to production domain
 *    - Add SSL/HTTPS configuration
 *    - Implement rate limiting
 *    - Add request validation middleware
 *    - Set up proper logging and monitoring
 *
 * 3. SECURITY ENHANCEMENTS:
 *    - Add API rate limiting
 *    - Implement request sanitization
 *    - Add security headers middleware
 *    - Set up CORS properly for production
 *
 * 4. PERFORMANCE:
 *    - Add caching layer (Redis)
 *    - Implement database connection pooling
 *    - Add compression middleware
 *    - Optimize database queries
 */

/**
 * JWT Token Verification Middleware
 * Validates JWT tokens and extracts user information
 *
 * This middleware:
 * - Extracts JWT token from Authorization header
 * - Verifies token validity and expiration
 * - Adds user information to request object
 * - Handles various token-related errors
 */

const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware function to verify JWT tokens
 * Must be used before routes that require authentication
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    // Extract token from "Bearer <token>" format
    // Supports both "Bearer token" and just "token" formats
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

    if (!token) {
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {
        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables");
            return res
                .status(500)
                .json({ error: "Server configuration error" });
        }

        // Verify and decode JWT token
        // This checks signature, expiration, and other claims
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user information to request object
        // This makes user data available in route handlers
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification error:", err.message);

        // Handle specific JWT errors
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        }

        // Generic token verification error
        res.status(401).json({ error: "Token verification failed" });
    }
};

/**
 * TODO: FUTURE AUTHENTICATION MIDDLEWARE ENHANCEMENTS
 *
 * 1. TOKEN MANAGEMENT:
 *    - Token refresh mechanism
 *    - Token blacklisting for logout
 *    - Multiple token support (refresh + access)
 *    - Token rotation for security
 *
 * 2. SECURITY FEATURES:
 *    - Rate limiting for auth endpoints
 *    - IP-based token validation
 *    - Device fingerprinting
 *    - Suspicious activity detection
 *
 * 3. SESSION MANAGEMENT:
 *    - Session tracking
 *    - Concurrent session limits
 *    - Session timeout handling
 *    - Force logout functionality
 *
 * 4. DATABASE CHANGES:
 *    - Add user_sessions table
 *    - Add token_blacklist table
 *    - Add auth_logs table
 */

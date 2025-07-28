/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 *
 * This module provides all authentication-related endpoints:
 * - POST /api/signup: Create new user account
 * - POST /api/login: Authenticate user and get JWT token
 * - GET /api/profile: Get current user profile
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Password hashing library
const jwt = require("jsonwebtoken"); // JWT token generation
const supabase = require("../supabaseClient"); // Database client

// ===== INPUT VALIDATION =====

/**
 * Validates signup input data
 * Ensures username and password meet security requirements
 *
 * @param {string} username - User's chosen username
 * @param {string} password - User's chosen password
 * @returns {Array} Array of validation error messages
 */
const validateSignupInput = (username, password) => {
    const errors = [];

    // Username validation
    if (!username || username.trim().length < 3) {
        errors.push("Username must be at least 3 characters long");
    }

    // Password validation
    if (!password || password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }

    // Username format validation (alphanumeric and underscore only)
    // Prevents SQL injection and ensures consistent usernames
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push(
            "Username can only contain letters, numbers, and underscores"
        );
    }

    return errors;
};

// ===== AUTHENTICATION ROUTES =====

/**
 * POST /api/signup
 * Creates a new user account with encrypted password
 *
 * Request Body: { username: string, password: string }
 * Response: { message: string, user: object, token: string }
 */
router.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    const validationErrors = validateSignupInput(username, password);
    if (validationErrors.length > 0) {
        return res.status(400).json({
            error: "Validation failed",
            details: validationErrors,
        });
    }

    try {
        // Check if username already exists
        // PGRST116 is Supabase's "no rows returned" error code
        const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("username")
            .eq("username", username.trim())
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            return res.status(500).json({
                error: "Database error while checking user existence",
                details: checkError.message,
            });
        }

        if (existingUser) {
            return res.status(409).json({
                error: "Username already exists. Please choose a different one.",
            });
        }

        // Hash password with bcrypt (12 rounds for security)
        // TODO: Consider increasing rounds for production (14-16)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user in database
        const { data, error } = await supabase
            .from("users")
            .insert([
                {
                    username: username.trim(),
                    password: hashedPassword,
                    role: "user", // Default role
                    created_at: new Date().toISOString(),
                },
            ])
            .select("id, username, role, created_at"); // Return user data without password

        if (error) {
            console.error("Signup error:", error);
            return res.status(500).json({
                error: "Something went wrong while signing up.",
                details: error.message,
            });
        }

        // Generate JWT token for immediate login
        // Token contains user ID, username, and role
        const token = jwt.sign(
            { id: data[0].id, username: data[0].username, role: data[0].role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // Token expires in 7 days
        );

        // Return success response with user data and token
        res.status(201).json({
            message: "User created successfully!",
            user: data[0],
            token,
        });
    } catch (err) {
        console.error("Signup catch error:", err);
        res.status(500).json({
            error: "Server error.",
            details: err.message,
        });
    }
});

/**
 * POST /api/login
 * Authenticates user and returns JWT token
 *
 * Request Body: { username: string, password: string }
 * Response: { message: string, user: object, token: string }
 */
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Basic input validation
    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required",
        });
    }

    try {
        // Find user by username
        const { data, error } = await supabase
            .from("users")
            .select("*") // Get all fields including password for verification
            .eq("username", username.trim())
            .single();

        if (error || !data) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password using bcrypt
        const isMatch = await bcrypt.compare(password, data.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: data.id, username: data.username, role: data.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Remove password from response for security
        const { password: _, ...userWithoutPassword } = data;

        res.json({
            message: "Login successful",
            user: userWithoutPassword,
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /api/profile
 * Returns current user's profile information
 * Requires valid JWT token in Authorization header
 *
 * Headers: Authorization: Bearer <token>
 * Response: { user: object }
 */
router.get("/profile", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user data from database (excluding password)
        const { data, error } = await supabase
            .from("users")
            .select("id, username, role, created_at")
            .eq("id", decoded.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: data });
    } catch (err) {
        console.error("Profile error:", err);
        res.status(401).json({ error: "Invalid token" });
    }
});

module.exports = router;

/**
 * TODO: FUTURE AUTHENTICATION ENHANCEMENTS
 *
 * 1. ADDITIONAL AUTH FEATURES:
 *    - Password reset functionality
 *    - Email verification
 *    - Two-factor authentication (2FA)
 *    - Social login (Google, Facebook, etc.)
 *    - Account deletion
 *
 * 2. SECURITY IMPROVEMENTS:
 *    - Password strength requirements
 *    - Account lockout after failed attempts
 *    - Session management
 *    - Token refresh mechanism
 *    - Audit logging for security events
 *
 * 3. USER PROFILE EXPANSION:
 *    - Profile picture upload
 *    - User preferences
 *    - Contact information
 *    - Account settings
 *
 * 4. DATABASE CHANGES:
 *    - Add email field to users table
 *    - Add password_reset_tokens table
 *    - Add user_sessions table
 *    - Add audit_logs table
 */

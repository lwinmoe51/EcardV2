/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 *
 * - POST /api/signup: Create new user account (username, email, password)
 * - POST /api/login: Authenticate user and get JWT token (username/email + password)
 * - GET /api/profile: Get current user profile
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const supabase = require("../supabaseClient");

// ===== INPUT VALIDATION =====

/**
 * Validates signup input data
 * Ensures username, email, and password meet security requirements
 */
const validateSignupInput = (username, email, password) => {
    const errors = [];
    if (!username || username.trim().length < 3) {
        errors.push("Username must be at least 3 characters long");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("A valid email is required");
    }
    if (!password || password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }
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
 * Request Body: { username, email, password }
 */
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    const validationErrors = validateSignupInput(username, email, password);
    if (validationErrors.length > 0) {
        return res
            .status(400)
            .json({ error: "Validation failed", details: validationErrors });
    }
    try {
        // Check for existing username or email
        const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("id")
            .or(`username.eq.${username.trim()},email.eq.${email.trim()}`)
            .maybeSingle();
        if (existingUser) {
            return res
                .status(409)
                .json({ error: "Username or email already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const { data, error } = await supabase
            .from("users")
            .insert([
                {
                    username: username.trim(),
                    email: email.trim(),
                    password: hashedPassword,
                    role: "user",
                    created_at: new Date().toISOString(),
                },
            ])
            .select("id, username, email, role, created_at");
        if (error) {
            return res.status(500).json({
                error: "Something went wrong while signing up.",
                details: error.message,
            });
        }
        const token = jwt.sign(
            {
                id: data[0].id,
                username: data[0].username,
                email: data[0].email,
                role: data[0].role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.status(201).json({
            message: "User created successfully!",
            user: data[0],
            token,
        });
    } catch (err) {
        res.status(500).json({ error: "Server error.", details: err.message });
    }
});

/**
 * POST /api/login
 * Authenticates user and returns JWT token
 * Request Body: { identifier, password } // identifier = username or email
 */
router.post("/login", async (req, res) => {
    const { identifier, password } = req.body; // identifier = username or email
    if (!identifier || !password) {
        return res
            .status(400)
            .json({ error: "Identifier and password are required" });
    }
    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .or(
                `username.eq.${identifier.trim()},email.eq.${identifier.trim()}`
            )
            .maybeSingle();
        if (error || !data) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, data.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign(
            {
                id: data.id,
                username: data.username,
                email: data.email,
                role: data.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        const { password: _, ...userWithoutPassword } = data;
        res.json({
            message: "Login successful",
            user: userWithoutPassword,
            token,
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /api/profile
 * Returns current user's profile information
 * Requires valid JWT token in Authorization header
 */
router.get("/profile", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { data, error } = await supabase
            .from("users")
            .select("id, username, email, role, created_at")
            .eq("id", decoded.id)
            .single();
        if (error || !data) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ user: data });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const supabase = require("../supabaseClient");

// Input validation helper
const validateSignupInput = (username, password) => {
    const errors = [];

    if (!username || username.trim().length < 3) {
        errors.push("Username must be at least 3 characters long");
    }

    if (!password || password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }

    // Check for valid username format (alphanumeric and underscore only)
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push(
            "Username can only contain letters, numbers, and underscores"
        );
    }

    return errors;
};

// Signup
// POST /api/signup
router.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    const validationErrors = validateSignupInput(username, password);
    if (validationErrors.length > 0) {
        return res.status(400).json({
            error: "Validation failed",
            details: validationErrors,
        });
    }

    try {
        // Check if user already exists
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

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const { data, error } = await supabase
            .from("users")
            .insert([
                {
                    username: username.trim(),
                    password: hashedPassword,
                    role: "user",
                    created_at: new Date().toISOString(),
                },
            ])
            .select("id, username, role, created_at");

        if (error) {
            console.error("Signup error:", error);
            return res.status(500).json({
                error: "Something went wrong while signing up.",
                details: error.message,
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: data[0].id, username: data[0].username, role: data[0].role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

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

// Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required",
        });
    }

    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", username.trim())
            .single();

        if (error || !data) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, data.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: data.id, username: data.username, role: data.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Remove password from response
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

// Get current user profile
router.get("/profile", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

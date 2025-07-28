const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");

const app = express();

// Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use("/api", authRoutes);
app.use("/api", usersRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
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

const PORT = process.env.PORT || 5000;

// Check required environment variables
if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET environment variable is required");
    process.exit(1);
}

// Warn about missing Supabase credentials but don't exit for development
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

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
});

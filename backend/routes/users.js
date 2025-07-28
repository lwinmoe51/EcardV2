/**
 * User Management Routes (Admin Only)
 * Provides administrative functions for managing users
 *
 * This module handles admin-only operations:
 * - GET /api/users: List all users
 * - PUT /api/users/:id: Update user role
 * - DELETE /api/users/:id: Delete user
 *
 * All routes require admin privileges
 */

const express = require("express");
const supabase = require("../supabaseClient");
const verifyToken = require("../middleware/auth"); // JWT verification middleware
const router = express.Router();

// ===== ADMIN AUTHORIZATION MIDDLEWARE =====

/**
 * Middleware to check if user has admin role
 * Must be used after verifyToken middleware
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function isAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
}

// ===== ADMIN ROUTES =====

/**
 * GET /api/users
 * Returns list of all users (admin only)
 *
 * Headers: Authorization: Bearer <admin_token>
 * Response: { users: Array }
 */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
    // Get all users excluding password field
    const { data, error } = await supabase
        .from("users")
        .select("id, username, role, created_at");

    if (error) return res.status(500).json({ error });
    res.json({ users: data });
});

/**
 * DELETE /api/users/:id
 * Deletes a user by ID (admin only)
 *
 * Headers: Authorization: Bearer <admin_token>
 * Params: id - User ID to delete
 * Response: { message: string }
 */
router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    // TODO: Add validation to prevent admin from deleting themselves
    // TODO: Add cascade deletion for user-related data (ecards, favorites, etc.)

    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) return res.status(500).json({ error });
    res.json({ message: "User deleted" });
});

/**
 * PUT /api/users/:id
 * Updates user role (admin only)
 *
 * Headers: Authorization: Bearer <admin_token>
 * Params: id - User ID to update
 * Body: { role: string }
 * Response: { message: string }
 */
router.put("/users/:id", verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // TODO: Add role validation (only allow 'user' or 'admin')
    // TODO: Add protection to prevent removing the last admin

    const { error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", id);

    if (error) return res.status(500).json({ error });
    res.json({ message: "User role updated" });
});

module.exports = router;

/**
 * TODO: FUTURE USER MANAGEMENT ENHANCEMENTS
 *
 * 1. ADDITIONAL USER OPERATIONS:
 *    - Bulk user operations
 *    - User search and filtering
 *    - User statistics and analytics
 *    - User activity tracking
 *
 * 2. ROLE MANAGEMENT:
 *    - Multiple role support (moderator, premium, etc.)
 *    - Role-based permissions system
 *    - Role hierarchy
 *
 * 3. USER DATA EXPANSION:
 *    - User preferences management
 *    - User activity history
 *    - User relationships/following
 *    - User verification status
 *
 * 4. DATABASE CHANGES:
 *    - Add user_permissions table
 *    - Add user_activity_logs table
 *    - Add user_preferences table
 *    - Add user_relationships table
 */

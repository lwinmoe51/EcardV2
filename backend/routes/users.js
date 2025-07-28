const express = require("express");
const supabase = require("../supabaseClient");
const verifyToken = require("../middleware/auth");
const router = express.Router();

async function isAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
}

router.get("/users", verifyToken, isAdmin, async (req, res) => {
    const { data, error } = await supabase
        .from("users")
        .select("id, username, role, created_at");
    if (error) return res.status(500).json({ error });
    res.json({ users: data });
});

router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) return res.status(500).json({ error });
    res.json({ message: "User deleted" });
});

router.put("/users/:id", verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const { error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", id);

    if (error) return res.status(500).json({ error });
    res.json({ message: "User role updated" });
});

module.exports = router;

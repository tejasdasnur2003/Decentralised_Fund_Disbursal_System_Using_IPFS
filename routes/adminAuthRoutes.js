const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Admin model (to be created in models folder)

const router = express.Router();

// Admin Signup Route
router.post("/signup", async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = new Admin({ username, password: hashedPassword, email });
        await newAdmin.save();

        res.status(201).json({ message: "Admin registered successfully!" });
    } catch (error) {
        console.error("❌ Admin Signup Error:", error.message);
        res.status(500).json({ message: "Error registering admin", error: error.message });
    }
});

// Admin Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin by email
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { adminId: admin._id, username: admin.username, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            message: "Admin login successful!",
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        console.error("❌ Admin Login Error:", error.message);
        res.status(500).json({ message: "Error logging in admin", error: error.message });
    }
});

module.exports = router;

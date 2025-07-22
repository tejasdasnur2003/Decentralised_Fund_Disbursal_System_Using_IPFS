const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Signup Route (for users and admins)
router.post("/signup", async (req, res) => {
    try {
        const { username, password, contact, email, role } = req.body;

        // Check if user already exists by email or username
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email or username already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save user
        const newUser = new User({ username, password: hashedPassword, contact, email, role });
        await newUser.save();

        console.log(`✅ New ${role} registered: ${username}`);

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Signup Error:", error.message);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(`🔍 Attempting login for: ${email}`);

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User not found!");
            return res.status(404).json({ message: "User not found" });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log("❌ Invalid password attempt!");
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "1h" }
        );

        console.log(`✅ Login successful for: ${email} as ${user.role}`);

        res.json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                contact: user.contact,
                role: user.role
            }
        });
    } catch (error) {
        console.error("❌ Login Error:", error.message);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});

module.exports = router;

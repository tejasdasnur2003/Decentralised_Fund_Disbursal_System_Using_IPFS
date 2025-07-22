const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Middleware to verify token and role
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, user) => {
        if (err) return res.status(403).json({ message: "Token is not valid" });
        req.user = user;
        next();
    });
};

// Protected route
router.get("/protected-route", authenticateToken, (req, res) => {
    res.json({ message: "You have accessed a protected route!", user: req.user });
});

// Admin-only route
const authenticateAdmin = (req, res, next) => {
    authenticateToken(req, res, () => {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        next();
    });
};

router.get("/admin-route", authenticateAdmin, (req, res) => {
    res.json({ message: "Welcome, Admin!", user: req.user });
});

module.exports = router;

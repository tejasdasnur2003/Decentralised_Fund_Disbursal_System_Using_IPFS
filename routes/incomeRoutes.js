const express = require("express");
const Income = require("../models/Income");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware to verify token
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

// Fetch income details by certificate number (Protected Route)
router.get("/get-income/:certificateNumber", authenticateToken, async (req, res) => {
    try {
        const record = await Income.findOne({ certificateNumber: req.params.certificateNumber });
        if (!record) return res.status(404).json({ message: "No record found" });
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
});

module.exports = router;

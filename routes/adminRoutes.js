const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const authenticateAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin Dashboard Route (Protected)
router.get("/dashboard", authenticateAdmin, (req, res) => {
    res.json({ message: "Welcome to the Admin Dashboard!", admin: req.admin });
});

// View Transactions Route (Protected)
router.get("/transactions", authenticateAdmin, async (req, res) => {
    try {
        // Placeholder for fetching transactions (Replace with actual data retrieval)
        const transactions = [
            { id: 1, recipient: "0x123...", amount: 1.5, status: "Success" },
            { id: 2, recipient: "0x456...", amount: 2.0, status: "Pending" }
        ];

        res.json({ message: "Transaction history retrieved!", transactions });
    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;

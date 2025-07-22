const express = require("express");
const axios = require("axios");
const Income = require("../models/Income");
const Recipient = require("../models/Recipient"); // <-- Import Recipient model
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

// Apply for Scheme Route (Protected Route)
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { certificateNumber, username, recipientAddress, annualIncome } = req.body;

        // Validate input
        if (!certificateNumber || !username || !recipientAddress || !annualIncome) {
            return res.status(400).json({ message: "❌ All fields are required!" });
        }

        // Fetch income details from MongoDB
        const incomeRecord = await Income.findOne({ certificateNumber });

        if (!incomeRecord) {
            return res.status(404).json({ message: "❌ No record found for this Certificate Number!" });
        }

        // Check eligibility
        if (incomeRecord.annualIncome > 400000) {
            return res.status(403).json({ message: "❌ Not eligible for the scheme (Income above ₹4,00,000)" });
        }

        // Prepare data for IPFS
        const applicantData = {
            certificateNumber,
            username,
            recipientAddress,
            annualIncome
        };

        // Upload to Pinata
        const pinataResponse = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", applicantData, {
            headers: {
                "Content-Type": "application/json",
                "pinata_api_key": process.env.PINATA_API_KEY,
                "pinata_secret_api_key": process.env.PINATA_SECRET_API_KEY,
            },
        });

        // Store recipient info in MongoDB
        await Recipient.create({
            certificateNumber,
            username,
            recipientAddress,
            annualIncome,
            ipfsHash: pinataResponse.data.IpfsHash
        });

        // Return response with IPFS hash
        res.json({
            message: "✅ Eligible for the scheme! Data stored on IPFS and MongoDB.",
            user: applicantData,
            ipfsHash: pinataResponse.data.IpfsHash,
        });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ message: "❌ Server Error: " + error.message });
    }
});

module.exports = router;

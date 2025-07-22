require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminOperations = require("./routes/adminOperations"); // Import the new adminOperations route
const incomeRoutes = require("./routes/incomeRoutes");
//const ipfsRoutes = require("./routes/ipfsRoutes"); we don't need this
const protectedRoutes = require("./routes/protectedRoutes");
const applyRoutes = require("./routes/applyRoutes");
const User = require("./models/User");
const Admin = require("./models/Admin");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminOperations); // Use the adminOperations route
app.use("/api/income", incomeRoutes);
//app.use("/api/ipfs", ipfsRoutes); we don't need it
app.use("/api", protectedRoutes);
app.use("/api/apply", applyRoutes);

// Route: Fetch all users
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).send("❌ Error fetching users: " + error.message);
    }
});

// Route: Fetch all admins
app.get("/api/admins", async (req, res) => {
    try {
        const admins = await Admin.find();
        res.json(admins);
    } catch (error) {
        res.status(500).send("❌ Error fetching admins: " + error.message);
    }
});

// Default Route
app.get("/", (req, res) => {
    res.send("Welcome to the API! 🚀");
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));

const jwt = require("jsonwebtoken");

// Middleware to authenticate admin
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
        if (err) {
            return res.status(403).json({ message: "Token is not valid" });
        }
        req.admin = admin; // Attach admin data to request object
        next();
    });
};

module.exports = authenticateAdmin;

const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema({
    certificateNumber: String,
    username: String,
    recipientAddress: String,
    annualIncome: Number,
    ipfsHash: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Recipient", recipientSchema);

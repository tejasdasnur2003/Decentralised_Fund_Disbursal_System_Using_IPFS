const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
    certificateNumber: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    annualIncome: { type: Number, required: true }
});

module.exports = mongoose.model("Income", incomeSchema);

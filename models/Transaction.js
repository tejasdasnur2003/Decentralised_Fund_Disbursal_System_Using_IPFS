// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txHash: { type: String, required: true },
  sender: { type: String, required: true },
  recipients: [{ type: String, required: true }],
  amountPerRecipient: { type: String, required: true },
  totalAmount: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['success', 'failed'],  // ✅ Lowercase only to match saved values
    required: true 
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);

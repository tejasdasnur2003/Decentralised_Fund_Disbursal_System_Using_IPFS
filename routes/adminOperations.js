const express = require('express');
const router = express.Router();
const { JsonRpcProvider, Contract, Wallet, parseEther, formatEther } = require('ethers');
const Transaction = require('../models/Transaction');
const authenticateAdmin = require('../middleware/adminMiddleware');
const recipientsModel = require('../models/Recipient');
require('dotenv').config();

// Load contract ABI and address
const contractABI = require('../artifacts/contracts/FixedRecipientsSender.sol/FixedRecipientsSender.json').abi;
const contractAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'; // Use actual deployed address

// ✅ Setup provider and signer (with private key from .env)
const provider = new JsonRpcProvider('http://127.0.0.1:8545');
const wallet = new Wallet(process.env.PRIVATE_KEY, provider); // signer

// ======================
// @route   POST /api/admin/send-funds
// @desc    Send equal funds to all eligible recipients
// @access  Private (Admin)
// ======================
router.post('/send-funds', authenticateAdmin, async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    const recipientsFromDB = await recipientsModel.find({}, 'recipientAddress');
    const recipients = recipientsFromDB.map(rec => rec.recipientAddress);

    if (!recipients.length) {
      return res.status(400).json({ error: 'No recipients available for fund transfer' });
    }

    const amountInWei = parseEther(amount.toString()); // ✅ returns BigInt
    const contract = new Contract(contractAddress, contractABI, wallet);

    // ✅ Update recipients
    const updateTx = await contract.updateRecipients(recipients);
    await updateTx.wait();
    console.log(`✅ Recipients updated. Tx hash: ${updateTx.hash}`);

    // ✅ Send funds (pass value directly as BigInt)
    const sendTx = await contract.sendFunds({ value: amountInWei });
    await sendTx.wait();
    console.log(`✅ Funds sent. Tx hash: ${sendTx.hash}`);

    const sender = await wallet.getAddress();
    const txHash = sendTx.hash;
    const totalAmount = formatEther(amountInWei);
    const amountPerRecipient = formatEther(amountInWei / BigInt(recipients.length)); // ✅ division as BigInt

    const newTransaction = new Transaction({
      txHash,
      sender,
      recipients,
      amountPerRecipient,
      totalAmount,
      status: 'success'
    });

    await newTransaction.save();

    res.json({
      message: 'Funds sent successfully',
      txHash,
      recipients,
      amountPerRecipient,
      totalAmount
    });

  } catch (error) {
    console.error('❌ Error during fund transfer:', error);
    res.status(500).json({ error: 'Failed to send funds' });
  }
});

// ======================
// @route   GET /api/admin/recipients
// @desc    Get all recipients
// @access  Private (Admin)
// ======================
router.get('/recipients', authenticateAdmin, async (req, res) => {
  try {
    const recipients = await recipientsModel.find({});
    res.json(recipients);
  } catch (err) {
    console.error('❌ Error fetching recipients:', err.message);
    res.status(500).json({ error: 'Failed to fetch recipients' });
  }
});

// ======================
// @route   GET /api/admin/transactions
// @desc    Get all past transactions
// @access  Private (Admin)
// ======================
router.get('/transactions', authenticateAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    res.json(transactions);
  } catch (err) {
    console.error('❌ Error fetching transactions:', err.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;

require("dotenv").config();
const axios = require("axios");
const { ethers } = require("ethers");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_API_URL = process.env.INFURA_API_URL;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// ABI of FixedRecipientsSender contract
const contractABI = [
    "function updateRecipients(address[] calldata _recipients) external"
];

// Fetch all stored IPFS hashes from Pinata
async function fetchIPFSHashes() {
    try {
        const response = await axios.get("https://api.pinata.cloud/data/pinList", {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_API_KEY,
            }
        });

        return response.data.rows.map(file => file.ipfs_pin_hash);
    } catch (error) {
        console.error("❌ Error fetching IPFS hashes from Pinata:", error.message);
        return [];
    }
}

// Fetch recipient addresses from IPFS
async function fetchRecipientsFromIPFS(ipfsHashes) {
    let recipients = [];

    for (const hash of ipfsHashes) {
        try {
            const url = `https://ipfs.io/ipfs/${hash}`;
            const response = await axios.get(url);
            const { recipientAddress } = response.data;

            if (recipientAddress) {
                recipients.push(recipientAddress);
            }
        } catch (error) {
            console.error(`❌ Error fetching data from IPFS hash ${hash}:`, error.message);
        }
    }

    return recipients;
}

// Update contract with recipient addresses
async function updateRecipientsInContract(recipients) {
    if (recipients.length === 0) {
        console.error("❌ No recipients found!");
        return;
    }

    const provider = new ethers.JsonRpcProvider(INFURA_API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

    try {
        const tx = await contract.updateRecipients(recipients);
        await tx.wait();
        console.log("✅ Recipients updated in contract:", recipients);
    } catch (error) {
        console.error("❌ Error updating contract:", error.message);
    }
}

// Run the process
(async () => {
    const ipfsHashes = await fetchIPFSHashes();  // Fetch all hashes dynamically
    if (ipfsHashes.length === 0) {
        console.error("❌ No IPFS hashes found.");
        return;
    }

    const recipients = await fetchRecipientsFromIPFS(ipfsHashes);
    await updateRecipientsInContract(recipients);
})();

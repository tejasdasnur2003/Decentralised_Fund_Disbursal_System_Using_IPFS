require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",  // Use the version of Solidity you're working with
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",  // Local Hardhat node URL
    },
  },
};

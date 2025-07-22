const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const FixedRecipientsSender = await hre.ethers.getContractFactory("FixedRecipientsSender");
    const fixedRecipientsSender = await FixedRecipientsSender.deploy();

    await fixedRecipientsSender.waitForDeployment(); // Correct function in Hardhat's ethers v6
    console.log("FixedRecipientsSender contract deployed to:", fixedRecipientsSender.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

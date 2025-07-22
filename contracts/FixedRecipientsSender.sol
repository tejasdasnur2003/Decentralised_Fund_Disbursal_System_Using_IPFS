// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract FixedRecipientsSender {
    address[] public recipients;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function updateRecipients(address[] calldata _recipients) external onlyOwner {
        delete recipients;
        for (uint i = 0; i < _recipients.length; i++) {
            recipients.push(_recipients[i]);
        }
    }

    // ✅ send equal amount to all recipients
    function sendFunds() external payable onlyOwner {
        require(recipients.length > 0, "No recipients set");
        uint perRecipient = msg.value / recipients.length;
        require(perRecipient > 0, "Insufficient ETH per recipient");

        for (uint i = 0; i < recipients.length; i++) {
            payable(recipients[i]).transfer(perRecipient);
        }
    }

    function getRecipients() external view returns (address[] memory) {
        return recipients;
    }
}

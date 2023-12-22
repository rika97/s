// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HarmonyBridge {

    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be positive.");

        // Note: SafeMath.sol for safety
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
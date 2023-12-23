// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// TODO: time locks
// TODO (server): return the deposited amount if tx fails on ArbitrumBridge.sol

// note: supports only ONE (native token)
contract HarmonyBridge {
    
    mapping(address => uint256) public balances;

    // events
    event Deposit(address indexed user, uint256 amount);
    event Receive(address indexed user, uint256 amount);

    receive() external payable {
        emit Receive(msg.sender, msg.value);
    }

    // TODO: fallback

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be positive");
        // note: SafeMath.sol for safety
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
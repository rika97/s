// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Verification.sol";

// TODO (server): revert transaction if not enough liquidity

// note: supports only native token
contract Bridge is Verification {

    // TODO: usedNonces
    // https://forum.openzeppelin.com/t/help-with-ecrecover-and-or-signing-verify/30026
    // mapping(uint256 => bool) usedNonces; ??

    bool private locked;
    mapping(address => uint256) public balances;

    constructor(address _trustedSigner) Verification(_trustedSigner) {}

    // events
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);
    event Receive(address indexed user, uint256 amount);

    // modifiers
    modifier noReentrant() {
         // TODO: if locked, queue requests
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    receive() external payable {
        emit Receive(msg.sender, msg.value);
    }

    // TODO: fallback

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be positive");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(address _account, uint256 _amount, bytes memory _signature) public noReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= _amount, "Not enough liquidity");
        require(verifySignature(_account, _amount, _signature), "Invalid signature");

        payable(_account).transfer(_amount);

        emit Withdraw(_account, _amount);
    }
}
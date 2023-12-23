// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// note: supports only ARB (native token)
contract ArbitrumBridge {

    address public owner; // contract owner
    address public trustedSigner; // address of the off-chain signer
    bool private locked;

    constructor(address _trustedSigner) {
        owner = msg.sender;
        trustedSigner = _trustedSigner;
    }

    // events
    event Withdrawl(address indexed user, uint256 amount);
    event Receive(address indexed user, uint256 amount);

    // modifiers
    modifier noReentrant() {
        // TOOD: if locked, queue requests
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    receive() external payable {
        emit Receive(msg.sender, msg.value);
    }

    // TODO: fallback

    function withdraw(uint256 _amount) public noReentrant {
        require(_amount > 0, "Amount must be greater than 0");

        // TODO (server): revert HarmonyBridge.sol transaction if not enough liquidity
        require(address(this).balance >= _amount, "Not enough liquidity");
        
        // TODO: verify user has deposited to HarmonyBridge.sol

        payable(msg.sender).transfer(_amount);

        emit Withdrawl(msg.sender, _amount);
    }

    function setTrustedSigner(address _trustedSigner) public onlyOwner {
        trustedSigner = _trustedSigner;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Verification.sol";

// TODO (server): revert HarmonyBridge.sol transaction if not enough liquidity

// note: supports only ARB (native token)
contract ArbitrumBridge is Verification {

    // TODO: usedNonces
    // https://forum.openzeppelin.com/t/help-with-ecrecover-and-or-signing-verify/30026
    // mapping(uint256 => bool) usedNonces; ??

    bool private locked;

    constructor(address _trustedSigner) Verification(_trustedSigner) {}

    // events
    event Withdraw(address indexed account, uint256 amount);
    event Receive(address indexed account, uint256 amount);

    // modifiers
    modifier noReentrant() {
        // TOOD: if locked, queue requests
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    receive() external payable {
        emit Receive(msg.sender, msg.value);
    }

    // TODO: fallback

    function withdraw(address _account, uint256 _amount, bytes memory _signature) public noReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= _amount, "Not enough liquidity");
        require(verifySignature(_account, _amount, _signature), "Invalid signature");

        payable(_account).transfer(_amount);

        emit Withdraw(_account, _amount);
    }
}
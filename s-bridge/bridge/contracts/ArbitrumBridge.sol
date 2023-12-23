// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// note: supports only ARB (native token)
contract ArbitrumBridge {

    bool private locked;

    event Withdrawl(address indexed user, uint256 amount);

    modifier noReentrant() {
        // TOOD: if locked, queue requests
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    function withdraw(uint256 _amount) noReentrant public {
        // TODO: ensure enough liquidity; revert if not enough liquidity

        // TODO: verify user has deposited to HarmonyBridge.sol

        payable(msg.sender).transfer(_amount);

        emit Withdrawl(msg.sender, _amount);
    }
}
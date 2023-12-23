// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// TODO: REMOVE!!!
import "hardhat/console.sol";

// TODO (server): revert HarmonyBridge.sol transaction if not enough liquidity

// TODO: move verifying logic to Verify.sol

// note: supports only ARB (native token)
contract ArbitrumBridge {

    // TODO: usedNonces??

    // https://forum.openzeppelin.com/t/help-with-ecrecover-and-or-signing-verify/30026
    // mapping(uint256 => bool) usedNonces; ??

    address public owner; // contract owner
    address public trustedSigner; // address of the off-chain signer
    bool private locked;

    constructor(address _trustedSigner) {
        owner = msg.sender;
        trustedSigner = _trustedSigner;
    }

    // events
    event Withdraw(address indexed user, uint256 amount);
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

    // TODO: only trustedSigner?
    function withdraw(address _user, uint256 _amount, bytes memory _signature) public noReentrant {
        console.log("SMART CONTRACT");
        console.log("\ntrustedSigner: ", trustedSigner);
        console.logBytes(_signature);

        require(_amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= _amount, "Not enough liquidity");
        require(_verifySignature(_user, _amount, _signature), "Invalid signature");

        payable(msg.sender).transfer(_amount);

        emit Withdraw(msg.sender, _amount);
    }

    // https://solidity-by-example.org/signature/
    function _verifySignature(address _user, uint256 _amount, bytes memory _signature) internal view returns (bool) {
        // create hash of the data
        bytes32 hash = keccak256(abi.encodePacked(_user, _amount));
        // standardized practice in Etheruem to distinguish between signatures for transactions and arbitrary messages
        // https://github.com/ethereum/EIPs/pull/683
        // https://ethereum.stackexchange.com/questions/19582/does-ecrecover-in-solidity-expects-the-x19ethereum-signed-message-n-prefix/21037
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        address signer = _recoverSigner(ethSignedHash, _signature);
        return signer == trustedSigner;
    }

    function _recoverSigner(bytes32 _ethSignedHash, bytes memory _signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);
        console.log("contract_R: ");
        console.logBytes32(r);
        console.log("contract_S: ");
        console.logBytes32(s);
        console.log("contract_V: ", v);

        console.log("\nethSignedHash: ");
        console.logBytes32(_ethSignedHash);

        address recovered = ecrecover(_ethSignedHash, v, r, s);
        console.log("\nrecoverd signer: ", recovered);

        return recovered;
    }

    function _splitSignature(bytes memory _signature) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        // signature length = r (32 bytes) + s (32 bytes) + v (1 byte)
        require(_signature.length == 65, "Invalid signature length");

        // https://docs.soliditylang.org/en/latest/assembly.html
        assembly {
            // in Ethereum's memory model, the first slot of a dynamic array contains the lenght of the array
            // skip first 32 bytes (array length)
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
    }

    function setTrustedSigner(address _trustedSigner) public onlyOwner {
        trustedSigner = _trustedSigner;
    }
}
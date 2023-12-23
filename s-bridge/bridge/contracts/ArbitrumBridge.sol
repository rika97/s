// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// TODO (server): revert HarmonyBridge.sol transaction if not enough liquidity

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

    function withdraw(uint256 _amount, bytes memory _signature) public noReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= _amount, "Not enough liquidity");
        require(_verifySignature(msg.sender, _amount, _signature), "Invalid signature");

        payable(msg.sender).transfer(_amount);

        emit Withdrawl(msg.sender, _amount);
    }

    // https://solidity-by-example.org/signature/
    function _verifySignature(address _user, uint256 _amount, bytes memory _signature) internal view returns (bool) {
        // signature length = r (32 bytes) + s (32 bytes) + v (1 byte)
        require(_signature.length == 65, "Invalid signature length");

        // create hash of the data
        bytes32 hash = keccak256(abi.encodePacked(_user, _amount));
        // standardized practice in Etheruem to distinguish between signatures for transactions and arbitrary messages
        // https://github.com/ethereum/EIPs/pull/683
        // https://ethereum.stackexchange.com/questions/19582/does-ecrecover-in-solidity-expects-the-x19ethereum-signed-message-n-prefix/21037
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        return _recoverSigner(ethSignedHash, _signature) == trustedSigner;
    }

    function _recoverSigner(bytes32 _ethSignedHash, bytes memory _signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);
        return ecrecover(_ethSignedHash, v, r, s);
    }

    function _splitSignature(bytes memory _signature) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
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
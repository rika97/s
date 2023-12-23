// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Verification {
   
    address public trustedSigner; // address of the off-chain signer
    address public owner; // contract owner

    constructor(address _trustedSigner) {
        trustedSigner = _trustedSigner;
        owner = msg.sender;
    }

    // modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function verifySignature(address _account, uint256 _amount, bytes memory _signature) public view returns (bool) {
        // process check here to avoid unnecessary computation
        require(_signature.length == 65, "Invalid signature length");


        bytes32 msgHash = keccak256(abi.encodePacked(_account, _amount));
        // https://github.com/ethereum/EIPs/pull/683
        // https://ethereum.stackexchange.com/questions/19582/does-ecrecover-in-solidity-expects-the-x19ethereum-signed-message-n-prefix/21037
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash));
        address recoveredSigner = _recoverSignerFromSignature(ethSignedHash, _signature);
        return recoveredSigner == trustedSigner;
    }

    function _recoverSignerFromSignature(bytes32 _message, bytes memory _signature) internal pure returns (address) {    
        uint8 v;
        bytes32 r;
        bytes32 s;
    
        // https://docs.soliditylang.org/en/latest/assembly.html
        assembly {
            // in Ethereum's memory model, the first slot of a dynamic array contains the lenght of the array
            // skip first 32 bytes (array length)

            // first 32 bytes, after the length prefix
            r := mload(add(_signature, 32))
            // second 32 bytes
            s := mload(add(_signature, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(_signature, 96)))
        }
    
        return ecrecover(_message, v, r, s);
    }

    function setTrustedSigner(address _account) public onlyOwner {
        trustedSigner = _account;
    }
}
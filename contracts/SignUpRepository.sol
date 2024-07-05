// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

struct SignupInfo {
    address account;
    bytes signature;
}

interface SignUpRepositoryEvents {
    event NewSignatureAdded(uint8 indexed version, string text, bytes32 messageHash);

    event Signature(address indexed account, uint8 indexed version, bytes signature);
}

contract SignUpRepository is SignUpRepositoryEvents, Ownable {
    using Strings for uint256;

    error IncorrectVersionException();

    error IncorrectSignatureException();

    bytes32 public messageHash;

    uint8 public signatureVersion;

    constructor() Ownable() {
  
   }

    function updateLegalText(uint8 newVersion, string memory message) external onlyOwner {
        if (newVersion <= signatureVersion) revert IncorrectVersionException();

        signatureVersion = newVersion;
        messageHash = prefixed(message);

        emit NewSignatureAdded(newVersion, message, messageHash);
    }

    function addSignature(address account, bytes memory signature) external {
        _addSignature(account, signature);
    }

    function addBatchSignatures(SignupInfo[] memory signatures) external {
        uint256 len = signatures.length;
        for (uint256 i; i < len; ++i) {
            _addSignature(signatures[i].account, signatures[i].signature);
        }
    }

    function _addSignature(address account, bytes memory signature) internal {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);

        if (account != ecrecover(messageHash, v, r, s)) {
            revert IncorrectSignatureException();
        }

        emit Signature(account, signatureVersion, signature);
    }

    /// signature methods.
    function splitSignature(bytes memory sig) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    /// builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(string memory message) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n", bytes(message).length.toString(), bytes(message))
        );
    }
}

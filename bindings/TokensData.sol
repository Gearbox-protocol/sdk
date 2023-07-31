// SPDX-License-Identifier: UNLICENSED
// Gearbox. Generalized leverage protocol that allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
// (c) Gearbox Foundation, 2023
pragma solidity ^0.8.17;

import {Tokens, TokenType} from "./Tokens.sol";

interface IERC20Check {
    function totalSupply() external view returns (uint256);
}

struct TokenData {
    Tokens id;
    address addr;
    string symbol;
    TokenType tokenType;
}

contract TokensDataLive {
    mapping(uint256 => TokenData[]) tokenDataByNetwork;
    mapping(uint256 => address) usdcByNetwork;

    uint16[] public connectedNetworks;

    constructor() {
        // $GENERATE_HERE$
    }

    function getTokenData() external view returns (TokenData[] memory) {
        return tokenDataByNetwork[block.chainid];
    }

    function getNetworkId() external view returns (uint256) {
        if (block.chainid == 1337 || block.chainid == 31337) {
            uint256 len = connectedNetworks.length;
            for (uint256 i = 0; i < len; i++) {
                if (checkNetworkId(connectedNetworks[i])) {
                    return connectedNetworks[i];
                }
            }
        }
        return block.chainid;
    }

    function checkNetworkId(uint16 _networkId) internal view returns (bool) {
        address tokenToCheck = usdcByNetwork[_networkId];

        if (!isContract(tokenToCheck)) {
            return false;
        }

        try IERC20Check(tokenToCheck).totalSupply() returns (uint256) {
            return true;
        } catch {
            return false;
        }
    }

    // This method relies on extcodesize/address.code.length, which returns 0
    // for contracts in construction, since the code is only stored at the end
    // of the constructor execution.
    function isContract(address account) internal view returns (bool) {
        return account.code.length > 0;
    }
}

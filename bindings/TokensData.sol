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
    uint16 public immutable networkId;
    mapping(uint16 => TokenData[]) tokenDataByNetwork;
    mapping(uint16 => address) usdcByNetwork;

    uint16[] public connectedNetworks;

    constructor() {
        // $GENERATE_HERE$
        networkId = getNetworkId();
    }

    function getTokenData() external view returns (TokenData[] memory) {
        return tokenDataByNetwork[networkId];
    }

    function getNetworkId() internal view returns (uint16) {
        uint256 len = connectedNetworks.length;
        for (uint256 i = 0; i < len; i++) {
            if (checkNetworkId(connectedNetworks[i])) {
                return connectedNetworks[i];
            }
        }

        revert("No network found");
    }

    function checkNetworkId(uint16 _networkId) internal view returns (bool) {
        try IERC20Check(usdcByNetwork[_networkId]).totalSupply() returns (uint256) {
            return true;
        } catch {
            return false;
        }
    }
}

// SPDX-License-Identifier: UNLICENSED
// Gearbox. Generalized leverage protocol that allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
// (c) Gearbox Foundation, 2023
pragma solidity ^0.8.17;

import {Tokens, TokenType} from "./Tokens.sol";

struct TokenData {
    Tokens id;
    address addr;
    string symbol;
    TokenType tokenType;
}

contract TokensDataLive {
    uint16 immutable networkId;
    mapping(uint16 => TokenData[]) tokenDataByNetwork;

    constructor(uint16 _networkId) {
        networkId = _networkId;
        // $GENERATE_HERE$
    }

    function getTokenData() external view returns (TokenData[] memory) {
        return tokenDataByNetwork[networkId];
    }
}

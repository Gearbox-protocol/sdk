// SPDX-License-Identifier: UNLICENSED
// Gearbox. Generalized leverage protocol that allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
// (c) Gearbox Holdings, 2023
pragma solidity ^0.8.17;

import {Tokens} from "./Tokens.sol";

enum TokenType {
    NO_TOKEN,
    NORMAL_TOKEN,
    CURVE_LP_TOKEN,
    YEARN_ON_NORMAL_TOKEN,
    YEARN_ON_CURVE_TOKEN,
    CONVEX_LP_TOKEN,
    CONVEX_STAKED_TOKEN,
    DIESEL_LP_TOKEN,
    GEAR_TOKEN,
    C_TOKEN,
    BALANCER_LP_TOKEN
}

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
        // $TOKEN_ADDRESSES$
    }

    function getTokenData() external view returns (TokenData[] memory) {
        return tokenDataByNetwork[networkId];
    }
}

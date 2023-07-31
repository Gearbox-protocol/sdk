// SPDX-License-Identifier: UNLICENSED
// Gearbox. Generalized leverage protocol that allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
// (c) Gearbox Foundation, 2023
pragma solidity ^0.8.17;

import {Tokens} from "./Tokens.sol";
import {Contracts} from "./SupportedContracts.sol";

import {TokensLib} from "./TokensLib.sol";

struct ChainlinkPriceFeedData {
    Tokens token;
    address priceFeed;
}

struct CurvePriceFeedData {
    Tokens lpToken;
    Tokens[] assets;
    Contracts pool;
}

struct TheSamePriceFeedData {
    Tokens token;
    Tokens tokenHasSamePriceFeed;
}

struct SingeTokenPriceFeedData {
    Tokens token;
}

struct CompositePriceFeedData {
    Tokens token;
    address targetToBaseFeed;
    address baseToUSDFeed;
}

struct BoundedPriceFeedData {
    Tokens token;
    address priceFeed;
    uint256 upperBound;
}

struct GenericLPPriceFeedData {
    Tokens lpToken;
    Tokens underlying;
}

struct RedStonePriceFeedData {
    Tokens token;
    string tokenSymbol;
    bytes32 dataFeedId;
    address[10] signers;
    uint8 signersThreshold;
}

contract PriceFeedDataLive {
    uint256 networkId;

    mapping(uint256 => ChainlinkPriceFeedData[]) chainlinkPriceFeedsByNetwork;
    mapping(uint256 => SingeTokenPriceFeedData[]) zeroPriceFeedsByNetwork;
    mapping(uint256 => CurvePriceFeedData[]) curvePriceFeedsByNetwork;
    mapping(uint256 => CurvePriceFeedData[]) curveCryptoPriceFeedsByNetwork;
    mapping(uint256 => TheSamePriceFeedData[]) theSamePriceFeedsByNetwork;
    mapping(uint256 => SingeTokenPriceFeedData[]) yearnPriceFeedsByNetwork;
    mapping(uint256 => BoundedPriceFeedData[]) boundedPriceFeedsByNetwork;
    mapping(uint256 => CompositePriceFeedData[]) compositePriceFeedsByNetwork;
    mapping(uint256 => SingeTokenPriceFeedData) wstethPriceFeedByNetwork;
    mapping(uint256 => GenericLPPriceFeedData[]) wrappedAaveV2PriceFeedsByNetwork;
    mapping(uint256 => GenericLPPriceFeedData[]) compoundV2PriceFeedsByNetwork;
    mapping(uint256 => GenericLPPriceFeedData[]) erc4626PriceFeedsByNetwork;
    mapping(uint256 => RedStonePriceFeedData[]) redStonePriceFeedsByNetwork;

    constructor(uint256 _networkId) {
        networkId = _networkId;
        // $GENERATE_HERE$
    }

    function chainlinkPriceFeeds(uint256 index) external view returns (ChainlinkPriceFeedData memory) {
        return chainlinkPriceFeedsByNetwork[networkId][index];
    }
}

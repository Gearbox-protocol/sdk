// SPDX-License-Identifier: UNLICENSED
// Gearbox. Generalized leverage protocol that allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
// (c) Gearbox Holdings, 2022
pragma solidity ^0.8.10;

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

struct CurveLikePriceFeedData {
    Tokens lpToken;
    Tokens curveToken;
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

contract PriceFeedDataLive {
    uint16 networkId;

    mapping(uint16 => ChainlinkPriceFeedData[]) chainlinkPriceFeedsByNetwork;
    SingeTokenPriceFeedData[] zeroPriceFeeds;
    CurvePriceFeedData[] curvePriceFeeds;
    CurveLikePriceFeedData[] likeCurvePriceFeeds;
    SingeTokenPriceFeedData[] yearnPriceFeeds;
    mapping(uint16 => BoundedPriceFeedData[]) boundedPriceFeedsByNetwork;
    mapping(uint16 => CompositePriceFeedData[]) compositePriceFeedsByNetwork;
    SingeTokenPriceFeedData wstethPriceFeed;

    constructor(uint16 _networkId) {
        networkId = _networkId;
        // $CHAINLINK_PRICE_FEEDS
        // $CURVE_LIKE_PRICE_FEEDS
        // $COMPOSITE_PRICE_FEEDS
        // $BOUNDED_PRICE_FEEDS

        // $ZERO_PRICE_FEEDS
        // $CURVE_PRICE_FEEDS
        // $YEARN_PRICE_FEEDS
        // $WSTETH_PRICE_FEED
    }

    function chainlinkPriceFeeds(uint256 index) external view returns (ChainlinkPriceFeedData memory) {
        return chainlinkPriceFeedsByNetwork[networkId][index];
    }
}

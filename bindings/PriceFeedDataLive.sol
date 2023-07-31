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
    uint16 networkId;

    mapping(uint16 => ChainlinkPriceFeedData[]) chainlinkPriceFeedsByNetwork;
    SingeTokenPriceFeedData[] zeroPriceFeeds;
    CurvePriceFeedData[] curvePriceFeeds;
    CurvePriceFeedData[] curveCryptoPriceFeeds;
    TheSamePriceFeedData[] theSamePriceFeeds;
    SingeTokenPriceFeedData[] yearnPriceFeeds;
    mapping(uint16 => BoundedPriceFeedData[]) boundedPriceFeedsByNetwork;
    mapping(uint16 => CompositePriceFeedData[]) compositePriceFeedsByNetwork;
    mapping(uint16 => SingeTokenPriceFeedData) wstethPriceFeed;
    GenericLPPriceFeedData[] wrappedAaveV2PriceFeeds;
    GenericLPPriceFeedData[] compoundV2PriceFeeds;
    GenericLPPriceFeedData[] erc4626PriceFeeds;
    RedStonePriceFeedData[] redStonePriceFeeds;

    constructor(uint16 _networkId) {
        networkId = _networkId;
        // $GENERATE_HERE$
    }

    function chainlinkPriceFeeds(uint256 index) external view returns (ChainlinkPriceFeedData memory) {
        return chainlinkPriceFeedsByNetwork[networkId][index];
    }
}

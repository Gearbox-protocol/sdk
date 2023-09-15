// SPDX-License-Identifier: BUSL-1.1
// Gearbox Protocol. Generalized leverage for DeFi protocols
// (c) Gearbox Holdings, 2021
pragma solidity ^0.8.10;

interface IOffchainOracle {
    function getRate(
        address srcToken,
        address dstToken,
        bool useWrappers
    ) external view returns (uint256 weightedRate);

    function getRateToEth(address srcToken, bool useSrcWrappers)
        external
        view
        returns (uint256 weightedRate);
}
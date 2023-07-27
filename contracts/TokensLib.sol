// SPDX-License-Identifier: UNLICENSED
// Gearbox. Generalized leverage protocol that allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
// (c) Gearbox Foundation, 2023
pragma solidity ^0.8.17;

import {Tokens} from "./Tokens.sol";

library TokensLib {
    function arrayOf(Tokens t1) external pure returns (Tokens[] memory tokensList) {
        tokensList = new Tokens[](1);
        tokensList[0] = t1;
    }

    function arrayOf(Tokens t1, Tokens t2) external pure returns (Tokens[] memory tokensList) {
        tokensList = new Tokens[](2);
        tokensList[0] = t1;
        tokensList[1] = t2;
    }

    function arrayOf(Tokens t1, Tokens t2, Tokens t3) external pure returns (Tokens[] memory tokensList) {
        tokensList = new Tokens[](3);
        tokensList[0] = t1;
        tokensList[1] = t2;
        tokensList[2] = t3;
    }

    function arrayOf(Tokens t1, Tokens t2, Tokens t3, Tokens t4) external pure returns (Tokens[] memory tokensList) {
        tokensList = new Tokens[](4);
        tokensList[0] = t1;
        tokensList[1] = t2;
        tokensList[2] = t3;
        tokensList[3] = t4;
    }
}

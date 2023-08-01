// SPDX-License-Identifier: UNLICENSED
// Gearbox. Generalized leverage protocol that allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
// (c) Gearbox Foundation, 2023
pragma solidity ^0.8.17;

import {Test} from "forge-std/Test.sol";
import {Contracts} from "./ContractType.sol";

struct ContractData {
    Contracts id;
    address addr;
    string name;
}

interface ISupportedContracts {
    function addressOf(Contracts c) external view returns (address);

    function nameOf(Contracts c) external view returns (string memory);

    function contractIndex(address) external view returns (Contracts);

    function contractCount() external view returns (uint256);
}

contract SupportedContracts is Test, ISupportedContracts {
    mapping(Contracts => address) public override addressOf;
    mapping(Contracts => string) public override nameOf;
    mapping(address => Contracts) public override contractIndex;
    mapping(uint256 => ContractData[]) public contractDataByNetwork;

    uint256 public override contractCount;

    constructor(uint256 _chainId) {
        // $GENERATE_HERE$

        ContractData[] storage cd = contractDataByNetwork[_chainId];

        uint256 len = cd.length;
        contractCount = len;
        unchecked {
            for (uint256 i; i < len; ++i) {
                addressOf[cd[i].id] = cd[i].addr;
                nameOf[cd[i].id] = cd[i].name;
                contractIndex[cd[i].addr] = cd[i].id;

                vm.label(cd[i].addr, cd[i].name);
            }
        }
    }
}

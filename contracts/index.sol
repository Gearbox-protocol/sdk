// SPDX-License-Identifier: UNLICENSED
// Gearbox Protocol. Generalized leverage for DeFi protocols
// (c) Gearbox Foundation, 2023.

pragma solidity ^0.8.10;

import {IDataCompressorV2_10} from "@gearbox-protocol/periphery-v3/contracts/interfaces/IDataCompressorV2_10.sol";
import {IDataCompressorV3_00} from "@gearbox-protocol/periphery-v3/contracts/interfaces/IDataCompressorV3_00.sol";
import {IAddressProviderV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IAddressProviderV3.sol";
import {IPoolV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IPoolV3.sol";
import {ICreditFacadeV3} from "@gearbox-protocol/core-v3/contracts/interfaces/ICreditFacadeV3.sol";
import {IPoolService} from "@gearbox-protocol/core-v2/contracts/interfaces/IPoolService.sol";
import {ICreditFacadeV2} from "@gearbox-protocol/core-v2/contracts/interfaces/ICreditFacadeV2.sol";
import {WATokenZapper} from "@gearbox-protocol/integrations-v3/contracts/zappers/WATokenZapper.sol";
import {WETHZapper} from "@gearbox-protocol/integrations-v3/contracts/zappers/WETHZapper.sol";
import {WstETHZapper} from "@gearbox-protocol/integrations-v3/contracts/zappers/WstETHZapper.sol";

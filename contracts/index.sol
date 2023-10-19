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
import {ICreditConfiguratorV2} from "@gearbox-protocol/core-v2/contracts/interfaces/ICreditConfiguratorV2.sol";
import {IZapper} from "@gearbox-protocol/integrations-v3/contracts/interfaces/zappers/IZapper.sol";

import {IGearStakingV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IGearStakingV3.sol";

// Adapters
import {ILidoV1Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/lido/ILidoV1Adapter.sol";
import {IBaseRewardPool} from "@gearbox-protocol/integrations-v3/contracts/integrations/convex/IBaseRewardPool.sol";
import {IConvexToken} from "@gearbox-protocol/integrations-v3/contracts/integrations/convex/IConvexToken.sol";
import {ICurvePool} from "@gearbox-protocol/integrations-v3/contracts/integrations/curve/ICurvePool.sol";
import {IConvexV1BaseRewardPoolAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/convex/IConvexV1BaseRewardPoolAdapter.sol";
import {IConvexV1BoosterAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/convex/IConvexV1BoosterAdapter.sol";

import {IInterestRateModel} from "@gearbox-protocol/core-v2/contracts/interfaces/IInterestRateModel.sol";
import {IUniswapV2Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/uniswap/IUniswapV2Adapter.sol";
import {IUniswapV3Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/uniswap/IUniswapV3Adapter.sol";
import {IYVault} from "@gearbox-protocol/integrations-v3/contracts/integrations/yearn/IYVault.sol";
import {IYearnV2Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/yearn/IYearnV2Adapter.sol";

import {IwstETHV1Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/lido/IwstETHV1Adapter.sol";
import {IstETH} from "@gearbox-protocol/integrations-v3/contracts/integrations/lido/IstETH.sol";
import {IwstETH} from "@gearbox-protocol/integrations-v3/contracts/integrations/lido/IwstETH.sol";
import {IPriceOracleBase} from "@gearbox-protocol/core-v2/contracts/interfaces/IPriceOracleBase.sol";

import {ICurveV1_2AssetsAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/curve/ICurveV1_2AssetsAdapter.sol";

import {ICurveV1_3AssetsAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/curve/ICurveV1_3AssetsAdapter.sol";

import {ICurveV1_4AssetsAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/curve/ICurveV1_4AssetsAdapter.sol";

import {IRouter} from
    "@gearbox-protocol/router-v3/contracts/interfaces/IRouter.sol";

 
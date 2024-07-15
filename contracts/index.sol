// SPDX-License-Identifier: UNLICENSED
// Gearbox Protocol. Generalized leverage for DeFi protocols
// (c) Gearbox Foundation, 2023.

pragma solidity ^0.8.10;

import {IDataCompressorV2_1} from "@gearbox-protocol/periphery-v3/contracts/interfaces/IDataCompressorV2_1.sol";
import {IDataCompressorV3} from "@gearbox-protocol/periphery-v3/contracts/interfaces/IDataCompressorV3.sol";
import {IAddressProviderV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IAddressProviderV3.sol";
import {IContractsRegister} from "@gearbox-protocol/core-v2/contracts/interfaces/IContractsRegister.sol";
import {IPoolV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IPoolV3.sol";
import {ILinearInterestRateModelV3} from "@gearbox-protocol/core-v3/contracts/interfaces/ILinearInterestRateModelV3.sol";
import {IPoolQuotaKeeperV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IPoolQuotaKeeperV3.sol";
import {IGaugeV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IGaugeV3.sol";
import {ICreditFacadeV3} from "@gearbox-protocol/core-v3/contracts/interfaces/ICreditFacadeV3.sol";
import {IPoolService} from "@gearbox-protocol/core-v2/contracts/interfaces/IPoolService.sol";
import {ICreditFacadeV2} from "@gearbox-protocol/core-v2/contracts/interfaces/ICreditFacadeV2.sol";
import {ICreditConfiguratorV2} from "@gearbox-protocol/core-v2/contracts/interfaces/ICreditConfiguratorV2.sol";
import {IERC20ZapperDeposits} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/zappers/IERC20ZapperDeposits.sol";
import {IETHZapperDeposits} from "@gearbox-protocol/integrations-v3/contracts/interfaces/zappers/IETHZapperDeposits.sol";
import {IZapper} from "@gearbox-protocol/integrations-v3/contracts/interfaces/zappers/IZapper.sol";
import {IZapperRegister} from "@gearbox-protocol/periphery-v3/contracts/interfaces/IZapperRegister.sol";
import {IDegenNFTV2} from "@gearbox-protocol/core-v2/contracts/interfaces/IDegenNFTV2.sol";
import {IBotListV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IBotListV3.sol";

import {IGearStakingV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IGearStakingV3.sol";
import {IControllerTimelockV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IControllerTimelockV3.sol";

// Adapters
import {IAaveV2_LendingPoolAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/aave/IAaveV2_LendingPoolAdapter.sol";
import {IAaveV2_WrappedATokenAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/aave/IAaveV2_WrappedATokenAdapter.sol";
import {IBalancerV2VaultAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/balancer/IBalancerV2VaultAdapter.sol";
import {ICompoundV2_CTokenAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/compound/ICompoundV2_CTokenAdapter.sol";
import {ILidoV1Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/lido/ILidoV1Adapter.sol";
import {IBaseRewardPool} from "@gearbox-protocol/integrations-v3/contracts/integrations/convex/IBaseRewardPool.sol";
import {IConvexToken} from "@gearbox-protocol/integrations-v3/contracts/integrations/convex/IConvexToken.sol";
import {ICurvePool} from "@gearbox-protocol/integrations-v3/contracts/integrations/curve/ICurvePool.sol";
import {IConvexV1BaseRewardPoolAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/convex/IConvexV1BaseRewardPoolAdapter.sol";
import {IConvexV1BoosterAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/convex/IConvexV1BoosterAdapter.sol";
import {IERC4626Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/erc4626/IERC4626Adapter.sol";

import {IInterestRateModel} from "@gearbox-protocol/core-v2/contracts/interfaces/IInterestRateModel.sol";
import {IUniswapV2Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/uniswap/IUniswapV2Adapter.sol";
import {IUniswapV3Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/uniswap/IUniswapV3Adapter.sol";
import {IYVault} from "@gearbox-protocol/integrations-v3/contracts/integrations/yearn/IYVault.sol";
import {IYearnV2Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/yearn/IYearnV2Adapter.sol";

import {IwstETHV1Adapter} from "@gearbox-protocol/integrations-v3/contracts/interfaces/lido/IwstETHV1Adapter.sol";
import {IstETH} from "@gearbox-protocol/integrations-v3/contracts/integrations/lido/IstETH.sol";
import {IwstETH} from "@gearbox-protocol/integrations-v3/contracts/integrations/lido/IwstETH.sol";
import {IPriceOracleBase} from "@gearbox-protocol/core-v2/contracts/interfaces/IPriceOracleBase.sol";
import {IPriceOracleV2} from "@gearbox-protocol/core-v2/contracts/interfaces/IPriceOracle.sol";
import {IPriceOracleV3} from "@gearbox-protocol/core-v3/contracts/interfaces/IPriceOracleV3.sol";
import {IPriceFeed} from "@gearbox-protocol/core-v2/contracts/interfaces/IPriceFeed.sol";
import {ILPPriceFeed} from "@gearbox-protocol/oracles-v3/contracts/interfaces/ILPPriceFeed.sol";
import {RedstonePriceFeed} from "@gearbox-protocol/oracles-v3/contracts/oracles/updatable/RedstonePriceFeed.sol";
import {CompositePriceFeed} from "@gearbox-protocol/oracles-v3/contracts/oracles/CompositePriceFeed.sol";

import {ICurveV1_2AssetsAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/curve/ICurveV1_2AssetsAdapter.sol";

import {ICurveV1_3AssetsAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/curve/ICurveV1_3AssetsAdapter.sol";

import {ICurveV1_4AssetsAdapter} from
    "@gearbox-protocol/integrations-v3/contracts/interfaces/curve/ICurveV1_4AssetsAdapter.sol";


import {IMulticall3} from "@gearbox-protocol/router-v3/lib/forge-std/src/interfaces/IMulticall3.sol";
import {IRouterV3} from "@gearbox-protocol/router-v3/contracts/interfaces/IRouterV3.sol";
import {IRouter} from "@gearbox-protocol/router/contracts/interfaces/IRouter.sol";

import {IFarmingPool} from "@1inch/farming/contracts/interfaces/IFarmingPool.sol";

import {PartialLiquidationBotV3} from "@gearbox-protocol/bots-v3/contracts/bots/PartialLiquidationBotV3.sol";

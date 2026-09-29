import type { Address } from "viem";
import type { MarketActions } from "../actions/index.js";
import type { MarketState } from "../market-state/types.js";

export function estimateActionGas(args: {
  action: MarketActions;
  afterState: MarketState;
}): number {
  const { action, afterState } = args;
  switch (action.type) {
    // Market domain
    case "MARKET::createMarket":
      switch (action.params.rateKeeperParams.type) {
        case "TUMBLER":
          return 11_600_000; // got 11,456,469
        case "GAUGE":
          return 12_300_000; // got 12,174,444
        default:
          throw new Error("Unsupported rate keeper type");
      }
    case "MARKET::createCreditSuite":
      return 14_600_000; // got 14,453,571
    case "MARKET::addAsset":
      // @dev dependends on price feed tree lenght
      // TODO: check estimation
      return 500_000; // got 411,732, 380,720 & 491,321
    case "MARKET::addPeripheryContract":
      return 120_000;

    // Bytecode Repository domain
    // @dev depends on the size of the deployed contract's init code
    // TODO: check estimation
    case "BCR::deployContract":
      return 3_000_000;

    // @note currently impossible action
    case "MARKET::updateLossPolicy":
      return 0;

    case "MARKET::updateRateKeeper":
      // @note depends on the number of quoted assets
      // @dev currently impossible if quoted more than 0 assets
      switch (action.params.type) {
        case "TUMBLER":
          return 1_100_000; // got 1,029,266
        case "GAUGE":
          return 1_750_000; // got 1,716,420
        default:
          throw new Error("Unsupported rate keeper type");
      }
    case "MARKET::updateInterestRateModel":
      return 800_000; // got 779,772

    // Pool domain
    case "POOL::setTotalDebtLimit":
      return 60_000; // got 58,403
    case "POOL::setTokenLimit":
      return 120_000; // got 116,016
    case "POOL::setTokenQuotaIncreaseFee":
      return 70_000; // got 65,571
    case "POOL::setCreditManagerDebtLimit":
      return 90_000; // got 82,447
    case "POOL::pause":
      return 65_000; // got 59,590
    case "POOL::unpause":
      return 65_000; // got 59,644

    // Oracle domain
    // @dev dependends on price feed tree lenght
    // TODO: check estimation
    case "ORACLE::setPriceFeed":
      return 150_000; // got 126,049
    case "ORACLE::setReservePriceFeed":
      return 150_000; // got 132,594

    // Credit domain
    case "CREDIT::addCollateralToken":
      return 180_000; // got 176,131
    case "CREDIT::allowAdapter":
      switch (action.params.adapter.type) {
        case "ERC4626_VAULT":
          return 1_100_000; // got 998,853, 994,659 & 1,011,759
        case "LIDO_WSTETH_V1":
          return 890_000; // got 877,652
        case "MELLOW_ERC4626_VAULT":
          return 950_000; // got 930,173
        case "DAI_USDS_EXCHANGE":
          return 950_000; // got 915,913
        case "BALANCER_V3_ROUTER":
          return 1_350_000; // got 1,317,074
        case "CAMELOT_V3_ROUTER":
          return 2_100_000; // got 2,006,114 &  2,023,21
        case "CVX_V1_BASE_REWARD_POOL":
          return 1_280_000; // got 1,250,044
        case "CVX_V1_BOOSTER":
          return 1_500_000; // got 1,476,235

        case "CURVE_V1_2ASSETS":
        case "CURVE_V1_3ASSETS":
        case "CURVE_V1_4ASSETS":
          return 2_000_000; // got 1,942,285 for 2 assets, other should be roughly the same

        case "CURVE_STABLE_NG":
          return 2_100_000; // got 2,023,751
        case "PENDLE_ROUTER":
          return 2_750_000; // got 2,710,289
        case "STAKING_REWARDS":
          return 990_000; // got 981,079
        case "TRADERJOE_ROUTER":
          // TODO:
          return 2_000_000;
        case "UNISWAP_V2_ROUTER":
          return 1_550_000; // got 1,517,137
        case "UNISWAP_V3_ROUTER":
          return 2_050_000; // got 2,001,065
        case "VELODROME_V2_ROUTER":
          // TODO:
          return 2_000_000;
        default:
          return 2_000_000;
      }
    case "CREDIT::forbidAdapter":
      return 130_000; // got 120,726, 104,027, 120,798 & 103,955
    case "CREDIT::setFees":
      return 90_000; // got 85,464
    case "CREDIT::rampLiquidationThreshold":
      return 90_000; // got 81,110
    case "CREDIT::forbidToken":
      return 110_000; // got 101,699
    case "CREDIT::allowToken":
      return 80_000; // got 77,414
    case "CREDIT::unpause":
      return 75_000; // got 70,985
    case "CREDIT::pause":
      return 75_000; // got 70,932
    case "CREDIT::setExpirationDate":
      return 80_000; // got 77,599
    case "CREDIT::upgradeCreditFacade":
      return 5_100_000; // got 5,061,039

    // Plugin actions
    // Rate keepers plugin actions
    case "RATE_KEEPER::TUMBLER::setRate": // got 73,674
    case "RATE_KEEPER::GAUGE::changeQuotaMinRate": // got 72,565
    case "RATE_KEEPER::GAUGE::changeQuotaMaxRate": // got
      return 75_000;
    case "RATE_KEEPER::TUMBLER::updateRates": {
      const quotedTokens = Object.keys(afterState.rateKeeper.rates).length;
      // got 94,601 with 1 quoted token
      // got 112,034 with 2 quoted tokens
      return 80_000 + 20_000 * quotedTokens;
    }

    // loss policies plugin actions
    case "LOSS_POLICY::ALIAS::setAlias":
      return 200_000; // got 196,334;

    // Adapters plugin actions
    // TODO: currently interface allows to add only one pair/pool
    // change estimation based on pairs/pools len after fix
    case "ADAPTER::BALANCER_V3_ROUTER::setPoolStatusBatch":
      return 135_000 + action.params.pools.length * 50_000; // got 167,969
    case "ADAPTER::CAMELOT_V3_ROUTER::setPoolStatusBatch":
      return 135_000 + action.params.pairs.length * 60_000; // got 188,433
    case "ADAPTER::CVX_V1_BOOSTER::updateSupportedPids": {
      const adapters = Object.keys(
        afterState.creditManagers[
          action.params.creditManager.toLowerCase() as Address
        ].adapters,
      ).length;
      // got 247,650 with 5 adapters (1/5 is baseRewardPool)
      // got 77,443 with 1 adapter (0/1 is baseRewardPool)
      return 35_000 + adapters * 43_000;
    }
    case "ADAPTER::PENDLE_ROUTER::setPairStatusBatch":
      return 135_000 + action.params.pairs.length * 160_000; // got 288,453
    case "ADAPTER::TRADERJOE_ROUTER::setPoolStatusBatch":
      // TODO:
      return 135_000 + action.params.pools.length * 160_000;
    case "ADAPTER::UNISWAP_V2_ROUTER::setPairBatchStatus":
      // got 188,465 for 1 pair
      // got 301,457 for 3 pairs
      return 135_000 + action.params.pairs.length * 60_000;
    case "ADAPTER::UNISWAP_V3_ROUTER::setPoolBatchStatus":
      return 135_000 + action.params.pools.length * 65_000; // got 190,529
    case "ADAPTER::VELODROME_V2_ROUTER::setPoolBatchStatus":
      // TODO:
      return 135_000 + action.params.pairs.length * 160_000;

    default:
      return 200_000;
  }
}

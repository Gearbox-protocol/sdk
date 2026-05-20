import type { Address } from "viem";
import { isStrategyCMDisabled } from "../../utils/strategies/strategy-info/is-strategy-cm-disabled.js";
import type { Strategy } from "../../utils/strategies/types/strategy.js";
import { getChainPhantomTokens } from "./get-chain-phantom-tokens.js";
import { getCMYouCanEarn } from "./get-cm-you-can-earn.js";
import { getNativeTokenAddress } from "./get-native-token-address.js";
import type { StrategyCMEarningsInfo } from "./strategy-earnings-types.js";
import type {
  APYList,
  CreditManagerData,
  PoolData,
  PricesRecord,
  TokenData,
} from "./types.js";

type EarningsList<CM extends CreditManagerData> = Array<
  StrategyCMEarningsInfo<CM>
>;

interface GearboxSDKFullState {
  pools: Record<Address, PoolData> | undefined;
  tokens:
    | {
        tokenDataList: Record<Address, TokenData>;
      }
    | undefined;
  addressProvider: {
    wrappedNativeToken: Address | undefined;
  };
  withdrawableAssets:
    | Record<Address, Array<{ withdrawalPhantomToken: Address }>>
    | undefined;
}

export function getStrategyYouCanEarn<CM extends CreditManagerData>({
  strategy,
  creditManagers,
  sdkState,
  apyList,
  quotaReserve,
  slippage,
  allPrices,
  walletBalances,
}: {
  strategy: Strategy;
  creditManagers: Record<Address, CM> | undefined;
  sdkState: GearboxSDKFullState | undefined;
  apyList: APYList | undefined;
  allPrices: PricesRecord | undefined;
  walletBalances: Record<`0x${string}`, bigint> | undefined;

  quotaReserve: number;
  slippage: number;
}): EarningsList<CM> {
  const strategyCMs = creditManagers;

  const baseInfo = {
    strategy: strategy.name,
    strategyChainId: strategy.chainId,
    strategyNetwork: strategy.network,
    strategyType: strategy.strategyType,
    strategyTokenOutAddress: strategy.tokenOutAddress,
  };

  if (!strategyCMs || !walletBalances || !allPrices || !apyList || !sdkState) {
    return [
      {
        status: "error",
        description:
          "No strategy cms or wallet balances or all prices or apy list or sdk state",
        otherInfo: baseInfo,
        data: undefined,
      },
    ];
  }

  const openableCMsList = Object.values(strategyCMs).filter(
    cm => !isStrategyCMDisabled(cm, cm.quotas[strategy.tokenOutAddress]),
  );
  if (openableCMsList.length === 0) {
    return [
      {
        status: "error",
        description: "No openable cms list",
        otherInfo: baseInfo,
        data: undefined,
      },
    ];
  }

  const pools = sdkState.pools;
  const tokensList = sdkState.tokens?.tokenDataList;
  if (!tokensList || !pools || Object.keys(pools).length === 0) {
    return [
      {
        status: "error",
        description: "No pools or tokens list",
        otherInfo: baseInfo,
        data: undefined,
      },
    ];
  }

  const ap = sdkState.addressProvider;
  const nativeTokenAddress = getNativeTokenAddress();

  const delayedPhantoms = getChainPhantomTokens(sdkState.withdrawableAssets);

  const results = openableCMsList.map(
    (creditManager): StrategyCMEarningsInfo<CM> => {
      const info = getCMYouCanEarn({
        allPrices,
        creditManager,
        tokensList,
        delayedPhantoms,
        nativeTokenAddress,
        wrappedNativeTokenAddress: ap.wrappedNativeToken,
        walletBalances,
        strategy,
        slippage,
        quotaReserve,
        apyList,
        pools,
      });

      return info;
    },
  );

  return results;
}

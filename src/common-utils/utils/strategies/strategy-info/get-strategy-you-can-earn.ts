import type { Address } from "viem";
import { isStrategyCMDisabled } from "../../strategies/strategy-info/is-strategy-cm-disabled.js";
import type {
  CreditManagerSlice,
  PoolSlice,
  TokenSlice,
} from "../strategy-info/types.js";
import { getChainPhantomTokens } from "../tokens/get-chain-phantom-tokens.js";
import { getNativeTokenAddress } from "../tokens/get-native-token-address.js";
import type { Strategy } from "../types/strategy.js";
import type { APYList, PricesRecord } from "../types/strategy-data.js";
import type { StrategyCMEarningsInfo } from "../types/strategy-earnings.js";
import { getCMYouCanEarn } from "./get-cm-you-can-earn.js";

type EarningsList<CM extends CreditManagerSlice> = Array<
  StrategyCMEarningsInfo<CM>
>;

interface GearboxSDKFullState {
  pools: Record<Address, PoolSlice> | undefined;
  tokens:
    | {
        tokenDataList: Record<Address, TokenSlice>;
      }
    | undefined;
  addressProvider: {
    wrappedNativeToken: Address | undefined;
  };
  withdrawableAssets:
    | Record<Address, Array<{ withdrawalPhantomToken: Address }>>
    | undefined;
}

export function getStrategyYouCanEarn<CM extends CreditManagerSlice>({
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

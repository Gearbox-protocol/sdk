import type { Address } from "viem";
import type { StrategyConfigPayload } from "../../../static/strategy.js";
import type { CreditManagerSlice, TokenSlice } from "../strategy-info/types.js";
import { isCollateralToken } from "../tokens/is-collateral-token.js";

type ExtraCollateralConfig = NonNullable<
  StrategyConfigPayload["additionalCollaterals"]
>[number];
type ExtraCollaterals = Record<Address, Array<ExtraCollateralConfig>>;

export interface GetCMAllowedCollateralsProps {
  creditManager: CreditManagerSlice | undefined;
  tokensList: Record<Address, TokenSlice>;
  zeroDebt?: boolean;
  delayedPhantoms: Record<Address, boolean>;
  extraCollaterals:
    | {
        list: ExtraCollaterals | undefined;
        prices: Record<Address, bigint> | undefined;
      }
    | undefined;

  nativeTokenAddress: Address;
  wrappedNativeTokenAddress: Address | undefined;
}

export function getCMAllowedCollaterals({
  creditManager,
  tokensList,
  zeroDebt = false,
  delayedPhantoms,
  extraCollaterals,

  nativeTokenAddress,
  wrappedNativeTokenAddress,
}: GetCMAllowedCollateralsProps): Record<Address, Address> {
  const tokens = creditManager?.collateralTokens;
  if (!tokens) return {};

  const collateralRecord = tokens.reduce<Record<Address, Address>>(
    (acc, address) => {
      const allowed = isCollateralToken({
        address,
        tokensList,
        creditManager,
        zeroDebt,
        delayedPhantoms,
        extraCollateralConfigs: extraCollaterals?.list?.[address],
        prices: extraCollaterals?.prices,
      });

      if (allowed) {
        acc[address] = address;
      }

      return acc;
    },
    {},
  );

  if (
    !creditManager.isPaused &&
    wrappedNativeTokenAddress &&
    collateralRecord[wrappedNativeTokenAddress] &&
    nativeTokenAddress
  ) {
    collateralRecord[nativeTokenAddress] = nativeTokenAddress;
  }

  return collateralRecord;
}

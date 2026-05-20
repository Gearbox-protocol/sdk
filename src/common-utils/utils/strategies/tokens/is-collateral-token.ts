import type { Address } from "viem";
import type { TokenData } from "../../../charts/token-data.js";
import type { StrategyConfigPayload } from "../../../static/strategy.js";
import type { CreditManagerData } from "../types/strategy-data.js";
import { isObtainableToken } from "./is-obtainable-token.js";
import { isValidExtraCollateralToken } from "./is-valid-extra-collateral-token.js";

type ExtraCollateralConfig = NonNullable<
  StrategyConfigPayload["additionalCollaterals"]
>[number];

export interface IsCollateralTokenProps {
  address: Address;
  tokensList: Record<Address, TokenData>;
  creditManager: CreditManagerData;
  delayedPhantoms: Record<Address, boolean>;

  extraCollateralConfigs: ExtraCollateralConfig[] | undefined;
  prices: Record<Address, bigint> | undefined;

  zeroDebt?: boolean;
}

export function isCollateralToken({
  address,
  tokensList,

  creditManager,
  zeroDebt = false,
  delayedPhantoms,
  extraCollateralConfigs,
  prices,
}: IsCollateralTokenProps) {
  // always allow underlying token as collateral
  if (creditManager && address === creditManager.underlyingToken) return true;
  // never allow any collaterals besides the underlying token on zero debt accounts
  if (zeroDebt && creditManager) return false;

  const token = tokensList[address];
  const cmCheckPassed = isObtainableToken({
    address,
    creditManager,
    delayedPhantoms,
  });

  const { isPhantom = false } = token || {};

  const allowedAsMain = !isPhantom && cmCheckPassed;
  const allowedAsExtra = isValidExtraCollateralToken({
    address,
    extraCollateralConfigs,
    creditManager,
    delayedPhantoms,
    tokensList,
    zeroDebt,
    prices,
  });

  return allowedAsMain || allowedAsExtra;
}

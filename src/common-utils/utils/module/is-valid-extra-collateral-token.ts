import type { Address } from "viem";

import { isForbiddenToken } from "../../utils/strategies/tokens/is-forbidden-token.js";
export interface IsValidExtraCollateralTokenProps {
  address: Address;
  extraCollateralConfigs:
    | Array<Address | { token: Address; cm: Address }>
    | undefined;
  prices: Record<Address, bigint> | undefined;
  creditManager:
    | {
        address: Address;
        underlyingToken: Address;
        forbiddenTokens: Record<Address, true>;
      }
    | undefined;
  tokensList: Record<Address, { isPhantom: boolean }>;
  delayedPhantoms: Record<Address, boolean>;
  zeroDebt?: boolean;
}

export function isValidExtraCollateralToken({
  address,
  extraCollateralConfigs,
  prices,
  creditManager,
  tokensList,
  delayedPhantoms,
  zeroDebt,
}: IsValidExtraCollateralTokenProps) {
  if (
    !extraCollateralConfigs ||
    extraCollateralConfigs.length === 0 ||
    !prices ||
    !creditManager
  )
    return false;

  // always allow underlying token as collateral
  if (creditManager && address === creditManager.underlyingToken) return true;
  // never allow any collaterals besides the underlying token on zero debt accounts
  if (zeroDebt && creditManager) return false;

  const forbidden = isForbiddenToken({ address, creditManager });
  const delayed = !!delayedPhantoms[address];

  const { isPhantom = false } = tokensList[address] || {};

  const isCMValid = extraCollateralConfigs.some(config => {
    const targetCM =
      typeof config === "string" ? creditManager.address : config.cm;

    const price = prices?.[address] || 0n;

    return targetCM === creditManager.address && price > 0n;
  });

  return !isPhantom && !forbidden && !delayed && isCMValid;
}

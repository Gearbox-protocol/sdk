import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";

import { TokensWithAPY } from "../apy";
import { CreditManagerData } from "./creditManager";

export interface StrategyPayload {
  name: string;
  lpTokenSymbol: TokensWithAPY;
  protocolSymbol: string;

  creditManagers: Array<string>;

  collateralTokens: Array<SupportedToken>;
  liquidationTokens: Array<SupportedToken>;
}

interface CalculateMaxAPYProps {
  apy: number;
  leverage: number;
  baseRateWithFee: number;
  quotaRateWithFee: number;
}

export class Strategy {
  readonly name: string;
  readonly lpTokenSymbol: TokensWithAPY;
  readonly protocolSymbol: string;

  readonly collateralTokens: Array<SupportedToken>;
  readonly liquidationTokens: Array<SupportedToken>;

  readonly creditManagers: Array<string>;

  constructor(payload: StrategyPayload) {
    this.name = payload.name;
    this.lpTokenSymbol = payload.lpTokenSymbol;
    this.protocolSymbol = payload.protocolSymbol;
    this.creditManagers = payload.creditManagers.map(addr =>
      addr.toLowerCase(),
    );
    this.collateralTokens = payload.collateralTokens;
    this.liquidationTokens = payload.liquidationTokens;
  }

  static maxLeverage(lpToken: string, cms: Array<PartialCM>) {
    const [maxThreshold] = Strategy.maxLeverageThreshold(lpToken, cms);

    const maxLeverage =
      (PERCENTAGE_FACTOR * LEVERAGE_DECIMALS) /
      (PERCENTAGE_FACTOR - maxThreshold);
    return Number(maxLeverage - LEVERAGE_DECIMALS);
  }

  static maxAPY({
    apy,
    leverage,
    baseRateWithFee,
    quotaRateWithFee,
  }: CalculateMaxAPYProps) {
    const collateralTerm = apy - quotaRateWithFee;

    const debtTerm =
      ((apy - baseRateWithFee - quotaRateWithFee) *
        (leverage - Number(LEVERAGE_DECIMALS))) /
      Number(LEVERAGE_DECIMALS);

    return collateralTerm + Math.floor(debtTerm);
  }

  protected static maxLeverageThreshold(
    lpToken: string,
    cms: Array<PartialCM>,
  ) {
    const lpTokenLC = lpToken.toLowerCase();
    const ltByCM: Array<[string, bigint]> = cms.map(cm => {
      const lt = cm.liquidationThresholds[lpTokenLC] || 0n;
      return [cm.address, lt];
    });

    const sorted = ltByCM.sort(([, ltA], [, ltB]) => {
      if (ltA > ltB) return -1;
      if (ltB > ltA) return 1;
      return 0;
    });

    const [cm = "", lt = 0n] = sorted[0] || [];

    return [lt, cm] as const;
  }
}

type PartialCM = Pick<CreditManagerData, "liquidationThresholds" | "address">;

import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  Protocols,
} from "@gearbox-protocol/sdk-gov";

import { CreditManagerData } from "./creditManager";

export interface StrategyPayload {
  apy?: number;

  name: string;
  lpToken: string;
  protocol: Protocols;

  creditManagers: Array<string>;

  baseAssets: Array<string>;
  unleveragableCollateral: Array<string>;
  leveragableCollateral: Array<string>;
}

interface CalculateMaxAPYProps {
  apy: number;
  leverage: number;
  baseRateWithFee: number;
  quotaRateWithFee: number;
}

export class Strategy {
  apy: number | undefined;
  readonly name: string;
  readonly lpToken: string;
  readonly protocol: Protocols;

  readonly baseAssets: Array<string>;
  readonly unleveragableCollateral: Array<string>;
  readonly leveragableCollateral: Array<string>;

  readonly creditManagers: Array<string>;

  constructor(payload: StrategyPayload) {
    this.apy = payload.apy;

    this.name = payload.name;
    this.lpToken = payload.lpToken.toLowerCase();
    this.protocol = payload.protocol;
    this.creditManagers = payload.creditManagers.map(addr =>
      addr.toLowerCase(),
    );
    this.baseAssets = payload.baseAssets.map(addr => addr.toLowerCase());
    this.unleveragableCollateral = payload.unleveragableCollateral.map(addr =>
      addr.toLowerCase(),
    );
    this.leveragableCollateral = payload.leveragableCollateral.map(addr =>
      addr.toLowerCase(),
    );
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

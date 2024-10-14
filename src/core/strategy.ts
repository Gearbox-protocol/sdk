import {
  LEVERAGE_DECIMALS,
  NetworkType,
  PartialRecord,
  PERCENTAGE_FACTOR,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { AllLPTokens } from "../apy";
import { CreditManagerData } from "./creditManager";

type ReleaseAt = undefined | number | PartialRecord<NetworkType, number>;

export interface StrategyPayload {
  name: string;
  lpTokenSymbol: AllLPTokens;
  protocolSymbol: string;

  collateralTokens: Array<SupportedToken>;

  releaseAt?: ReleaseAt;
}

interface CalculateMaxAPYProps {
  apy: number;
  leverage: number;
  baseRateWithFee: number;
  quotaRateWithFee: number;
}

export class Strategy {
  readonly name: string;
  readonly lpTokenSymbol: AllLPTokens;
  readonly protocolSymbol: string;

  readonly releaseAt: ReleaseAt;

  readonly collateralTokens: Array<SupportedToken>;

  constructor(payload: StrategyPayload) {
    this.name = payload.name;
    this.lpTokenSymbol = payload.lpTokenSymbol;
    this.protocolSymbol = payload.protocolSymbol;
    this.collateralTokens = payload.collateralTokens;

    this.releaseAt = payload.releaseAt;
  }

  static maxLeverage(lpToken: Address, cms: Array<PartialCM>) {
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
    lpToken: Address,
    cms: Array<PartialCM>,
  ) {
    const lpTokenLC = lpToken.toLowerCase() as Address;
    const ltByCM: Array<[Address, bigint]> = cms.map(cm => {
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

  static isStrategyReleased(
    releaseAt: ReleaseAt,
    currentTimestamp: number,
    network: NetworkType,
  ) {
    if (releaseAt === undefined) return true;
    if (typeof releaseAt === "number") return currentTimestamp > releaseAt;

    const releaseAtNetwork = releaseAt[network];
    if (releaseAtNetwork === undefined) return true;

    return currentTimestamp > releaseAtNetwork;
  }
}

type PartialCM = Pick<CreditManagerData, "liquidationThresholds" | "address">;

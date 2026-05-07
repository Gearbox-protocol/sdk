import type { Address } from "viem";

const EMPTY_ADDRESS = "" as Address;

export function maxLeverageThreshold(
  lpToken: Address,
  cms: Array<{
    liquidationThresholds: Record<Address, bigint>;
    address: Address;
  }>,
): readonly [bigint, Address] {
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

  const [cm = EMPTY_ADDRESS, lt = 0n] = sorted[0] || [];

  return [lt, cm] as const;
}

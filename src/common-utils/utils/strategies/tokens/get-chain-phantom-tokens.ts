import type { Address } from "viem";

interface WithdrawableAssetClient {
  withdrawalPhantomToken: Address;
}

export function getChainPhantomTokens(
  config: Record<Address, WithdrawableAssetClient[]> | undefined,
) {
  const allConfigs = Object.values(config || {}).flat(1);

  const r = allConfigs.reduce<Record<Address, boolean>>((acc, cfg) => {
    acc[cfg.withdrawalPhantomToken] = true;
    return acc;
  }, {});

  return r;
}

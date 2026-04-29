import type { OffchainCurator } from "../offchain/index.js";

export type OffchainCuratorData = OffchainCurator;
export type MarketConfiguratorRef =
  OffchainCurator["marketConfigurators"][number];

import type { Address } from "viem";

export type TokenMigration = "pt";

export interface TokenMigrationConfigPayload {
  // chain id and network type as they are written in sdk. wrong entries are being omitted
  chainId: number;
  network: string;
  // type, probably in the future there will be more migration types
  type: TokenMigration;

  // token to migrate from
  source: Address;
  // source token expiration time in ms
  expired: number;
  // token to migrate to
  target: Address;
}

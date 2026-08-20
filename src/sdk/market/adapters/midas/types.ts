import type { Address, Hex } from "viem";

import type { IAdapterContract } from "../types.js";

export interface IMidasAdapter extends IAdapterContract {
  mToken: Address;
}

export interface MidasGatewayAdapterParams {
  creditManager: Address;
  targetContract: Address;
  gateway: Address;
  mToken: Address;
  quoteToken: Address;
  phantomToken: Address;
  referrerId: Hex;
}

export interface MidasIssuanceVaultAdapterParams {
  creditManager: Address;
  targetContract: Address;
  mToken: Address;
  referrerId: Hex;
  allowedTokens: Address[];
}

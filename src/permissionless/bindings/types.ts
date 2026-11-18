import type { Address, Hex } from "viem";

export interface DeployParams {
  postfix: Hex;
  salt: Hex;
  constructorParams: Hex;
}

export interface AllowTokenParams {
  creditManager: Address;
  token: Address;
}

export interface ForbidAdapterParams {
  creditManager: Address;
  target: Address;
}

export interface ForbidTokenParams {
  creditManager: Address;
  token: Address;
}

export interface PauseCreditManagerParams {
  creditManager: Address;
}

export interface SetExpirationDateParams {
  creditManager: Address;
  expirationDate: number;
}

export interface CreditManagerFees {
  feeLiquidation: number;
  feeLiquidationExpired: number;
  feeLiquidationPremium: number;
  feeLiquidationPremiumExpired: number;
}

export interface SetFeesParams {
  creditManager: Address;
  params: CreditManagerFees;
}

export interface UnpauseCreditManagerParams {
  creditManager: Address;
}

export interface AddAssetParams {
  token: Address;
  priceFeed: Address;
}

export interface SetPriceFeedParams {
  token: Address;
  priceFeed: Address;
}

export interface SetReservePriceFeedParams {
  token: Address;
  priceFeed: Address;
}

export interface SetTokenQuotaIncreaseFeeParams {
  token: Address;
  fee: number; // percentage
}

export interface Market {
  address: Address;
  underlyingAsset: Address;
  name: string;
  symbol: string;
  isDeployed: boolean;
}

export enum AccessMode {
  Permissionless = 0,
  Permissioned = 1,
  Forbidden = 2,
}

export type PeripheryDomain = "ZAPPER" | "DEGEN_NFT";

/**
 * Emergency admin of a market configurator, as seen by the SDK
 * - `direct`: emergency admin is an EOA or Safe that calls the market configurator itself
 * - `killSwitch`: emergency admin is a `KILL_SWITCH_PROXY`, `caller` executes emergency calls
 *   via `proxyCall` until `owner` kills the proxy
 */
export type EmergencyAdmin =
  | {
      type: "direct";
      address: Address;
      /**
       * Address that must send emergency transactions
       */
      executor: Address;
    }
  | {
      type: "killSwitch";
      /**
       * Address of the kill switch proxy
       */
      address: Address;
      caller: Address;
      owner: Address;
      isKilled: boolean;
      /**
       * Address that must send emergency transactions, i.e. proxy caller
       */
      executor: Address;
    };

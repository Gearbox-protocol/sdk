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

export interface PriceUpdate {
  priceFeed: Address;
  data: Hex;
}
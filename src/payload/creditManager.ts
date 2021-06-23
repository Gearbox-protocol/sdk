import { BigNumberish } from "ethers";

export interface AdapterPayload {
  allowedContract: string;
  adapter: string
}

export interface CreditManagerDataPayload {
  addr: string;
  hasAccount?: boolean;
  kind?: string;
  underlyingToken?: string;
  isWETH?: boolean;
  canBorrow?: boolean;
  borrowRate?: BigNumberish;
  minAmount?: BigNumberish;
  maxAmount?: BigNumberish;
  maxLeverageFactor?: BigNumberish;
  availableLiquidity?: BigNumberish;
  allowedTokens?: Array<string>;
  adapters?: Array<AdapterPayload>;
}

export interface CreditManagerStatPayload {
  addr: string;
  kind?: string;
  underlyingToken?: string;
  isWETH?: boolean;
  canBorrow?: boolean;
  borrowRate?: BigNumberish;
  minAmount?: BigNumberish;
  maxAmount?: BigNumberish;
  maxLeverageFactor?: BigNumberish;
  availableLiquidity?: BigNumberish;
  allowedTokens?: Array<string>;
  allowedContracts?: Array<string>;
  openedAccountsCount?: number;
  totalOpenedAccounts?: number;
  totalClosedAccounts?: number;
  totalRepaidAccounts?: number;
  totalLiquidatedAccounts?: number;
  totalBorrowed?: BigNumberish;
  cumulativeBorrowed?: BigNumberish;
  totalRepaid?: BigNumberish;
  totalProfit?: BigNumberish;
  totalLosses?: BigNumberish;
}

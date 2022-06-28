import { BigNumberish } from "ethers";

export interface AdapterPayload {
  allowedContract: string;
  adapter: string;
}

export interface CreditManagerDataPayload {
  addr: string;
  underlyingToken?: string;

  isWETH?: boolean;
  canBorrow?: boolean;

  borrowRate?: BigNumberish;
  minAmount?: BigNumberish;
  maxAmount?: BigNumberish;

  maxLeverageFactor?: BigNumberish; // for V1 only
  availableLiquidity?: BigNumberish;

  allowedTokens?: Array<string>;
  adapters?: Array<AdapterPayload>;

  liquidationThresholds?: Array<BigNumberish>;

  version?: number;

  creditFacade?: string; // V2 only: address of creditFacade
  isDegenMode?: boolean; // V2 only: true if contract is in Degen mode
  degenNFT?: string; // V2 only: degenNFT, address(0) if not in degen mode

  isIncreaseDebtForbidden?: boolean; // V2 only: true if increasing debt is forbidden
  forbiddenTokenMask?: BigNumberish; // V2 only: mask which forbids some particular tokens
}

export interface CreditManagerStatPayload {
  addr: string;
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
  uniqueUsers: number;
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

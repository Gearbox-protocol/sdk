import { BigNumberish, BigNumber } from "ethers";
import { CreditManagerDataStructOutput } from "../typesV2/contracts/interfaces/IDataCompressor.sol/IDataCompressor";

export interface AdapterPayload {
  allowedContract: string;
  adapter: string;
}

export type CreditManagerDataPayload = CreditManagerDataStructOutput;

export interface CreditManagerStatPayload extends CreditManagerDataPayload {
  addr: string;
  underlyingToken?: string;
  isWETH: boolean;
  canBorrow: boolean;
  borrowRate: BigNumber;
  minAmount: BigNumber;
  maxAmount: BigNumber;
  maxLeverageFactor: BigNumber;
  availableLiquidity: BigNumber;
  allowedTokens: Array<string>;
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

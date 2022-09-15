import { BigNumberish } from "ethers";

import { CreditManagerDataStructOutput } from "../types/contracts/interfaces/IDataCompressor.sol/IDataCompressor";

export interface AdapterPayload {
  allowedContract: string;
  adapter: string;
}

export type CreditManagerDataPayload = CreditManagerDataStructOutput;

export interface CreditManagerStatPayload extends CreditManagerDataPayload {
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

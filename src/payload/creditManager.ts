import { BigNumberish } from "ethers";

import { CreditManagerDataStructOutput } from "../types/@gearbox-protocol/core-v2/contracts/interfaces/IDataCompressor.sol/IDataCompressor";
import { ExcludeArrayProps } from "../utils/types";

export interface AdapterPayload {
  allowedContract: string;
  adapter: string;
}

export type CreditManagerDataPayload =
  ExcludeArrayProps<CreditManagerDataStructOutput>;

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

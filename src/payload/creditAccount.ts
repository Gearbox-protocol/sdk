import { BigNumberish } from "ethers";
import { CreditAccountDataStructOutput } from "../typesV2/contracts/interfaces/IDataCompressor.sol/IDataCompressor";

export interface TokenBalancePayload {
  token: string;
  balance: BigNumberish;
  isAllowed: boolean;
}

export type CreditAccountDataPayload = CreditAccountDataStructOutput;

export type CreditAccountDataExtendedPayload = CreditAccountDataStructOutput;

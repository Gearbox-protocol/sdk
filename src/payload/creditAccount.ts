import {
  CreditAccountDataStruct,
  CreditAccountDataStructOutput,
} from "../types/contracts/interfaces/IDataCompressor.sol/IDataCompressor";
import { ExcludeArray } from "../utils/types";

export type TokenBalancePayload = CreditAccountDataStruct["balances"];

export type CreditAccountDataPayload =
  ExcludeArray<CreditAccountDataStructOutput>;

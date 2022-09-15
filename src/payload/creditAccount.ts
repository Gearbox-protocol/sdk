import {
  CreditAccountDataStruct,
  CreditAccountDataStructOutput,
} from "../types/contracts/interfaces/IDataCompressor.sol/IDataCompressor";

export type TokenBalancePayload = CreditAccountDataStruct["balances"];

export type CreditAccountDataPayload = CreditAccountDataStructOutput;

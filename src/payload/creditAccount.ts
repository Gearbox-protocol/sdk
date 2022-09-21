import {
  CreditAccountDataStruct,
  CreditAccountDataStructOutput,
} from "../types/contracts/interfaces/IDataCompressor.sol/IDataCompressor";
import { ExcludeArrayProps } from "../utils/types";

export type TokenBalancePayload = CreditAccountDataStruct["balances"];

export type CreditAccountDataPayload =
  ExcludeArrayProps<CreditAccountDataStructOutput>;

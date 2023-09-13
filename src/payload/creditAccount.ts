import { ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import {
  CreditAccountDataStruct,
  CreditAccountDataStructOutput,
} from "../types/@gearbox-protocol/core-v2/contracts/interfaces/IDataCompressor.sol/IDataCompressor";
/*  */
export type TokenBalancePayload = CreditAccountDataStruct["balances"];

export type CreditAccountDataPayload =
  ExcludeArrayProps<CreditAccountDataStructOutput>;

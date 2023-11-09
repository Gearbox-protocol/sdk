import { ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import {
  CreditAccountDataStructOutput,
  TokenBalanceStructOutput,
} from "../types/IDataCompressorV3_00";
import { BigintifyProps, PartialKeys } from "../utils/types";

export type CaTokenBalance = BigintifyProps<
  ExcludeArrayProps<TokenBalanceStructOutput>
>;

export type CreditAccountDataPayload = PartialKeys<
  ExcludeArrayProps<CreditAccountDataStructOutput>,
  "accruedInterest" | "accruedFees" | "healthFactor" | "totalValue"
>;

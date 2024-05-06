import { ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import {
  CreditAccountDataStructOutput,
  TokenBalanceStructOutput,
} from "../types/IDataCompressorV3";
import { PartialKeys } from "../utils/types";

export type CaTokenBalance = ExcludeArrayProps<TokenBalanceStructOutput>;

export type CreditAccountDataPayload = PartialKeys<
  ExcludeArrayProps<CreditAccountDataStructOutput>,
  "accruedInterest" | "accruedFees" | "healthFactor" | "totalValue"
>;

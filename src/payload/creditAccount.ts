import { Address, ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import { CreditAccountDataStructOutput } from "../types/IDataCompressorV3";
import { PartialKeys } from "../utils/types";

export interface CaTokenBalance {
  token: Address;
  balance: bigint;
  isForbidden: boolean;
  isEnabled: boolean;
  isQuoted: boolean;
  quota: bigint;
  quotaRate: bigint;
  quotaCumulativeIndexLU: bigint;
}

export type CreditAccountDataPayload = PartialKeys<
  ExcludeArrayProps<CreditAccountDataStructOutput>,
  "accruedInterest" | "accruedFees" | "healthFactor" | "totalValue"
>;

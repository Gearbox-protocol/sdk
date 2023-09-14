import { ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import {
  CreditAccountDataStructOutput,
  ScheduledWithdrawalStructOutput,
  TokenBalanceStructOutput,
} from "../types-v3/IDataCompressorV3_00";
import { BigintifyProps } from "../utils/types";

export type CaTokenBalance = BigintifyProps<
  ExcludeArrayProps<TokenBalanceStructOutput>
>;

export type ScheduledWithdrawal = BigintifyProps<
  ExcludeArrayProps<ScheduledWithdrawalStructOutput>
>;

export type CreditAccountDataPayload =
  ExcludeArrayProps<CreditAccountDataStructOutput>;

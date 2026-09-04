import { z } from "zod/v4";
import { ZodAddress, ZodBigInt } from "../onchain/utils/zod.js";

const delayedIncreaseLeverageIntentSchema = z.object({
  type: z.literal("INCREASE_LEVERAGE"),
});

const delayedDepositIntentSchema = z.object({
  type: z.literal("DEPOSIT"),
});

const delayedDepositAndIncreaseLeverageIntentSchema = z.object({
  type: z.literal("DEPOSIT_AND_INCREASE_LEVERAGE"),
});

const delayedWithdrawCollateralIntentSchema = z.object({
  type: z.literal("WITHDRAW_COLLATERAL"),
  to: ZodAddress(),
  withdrawToken: ZodAddress(),
  withdrawAmount: ZodBigInt(),
  sourceToken: ZodAddress(),
  debtRepaid: ZodBigInt(),
});

const delayedCloseAccountIntentSchema = z.object({
  type: z.literal("CLOSE_ACCOUNT"),
  to: ZodAddress(),
});

const delayedAddCollateralIntentSchema = z.object({
  type: z.literal("ADD_COLLATERAL"),
});

const delayedDecreaseLeverageIntentSchema = z.object({
  type: z.literal("DECREASE_LEVERAGE"),
});

/**
 * {@link DelayedIntent}
 **/
export const delayedIntentSchema = z.discriminatedUnion("type", [
  delayedIncreaseLeverageIntentSchema,
  delayedDepositIntentSchema,
  delayedDepositAndIncreaseLeverageIntentSchema,
  delayedWithdrawCollateralIntentSchema,
  delayedCloseAccountIntentSchema,
  delayedAddCollateralIntentSchema,
  delayedDecreaseLeverageIntentSchema,
]);

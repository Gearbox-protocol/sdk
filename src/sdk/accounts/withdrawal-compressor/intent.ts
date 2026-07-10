import type { Hex } from "viem";
import { decodeAbiParameters, encodeAbiParameters } from "viem";
import { z } from "zod/v4";
import { ZodAddress } from "../../utils/index.js";

/**
 * App: 1.1 Deposit and 4.1 Adjust leverage — raise leverage at fixed TVL.
 * Borrow `underlying` -> swap `underlying` into `targetToken` -> [withdraw to wallet].
 **/
export const delayedIncreaseLeverageIntentSchema = z.object({
  type: z.literal("INCREASE_LEVERAGE"),
  to: ZodAddress(),
});
export type DelayedIncreaseLeverageIntent = z.infer<
  typeof delayedIncreaseLeverageIntentSchema
>;

/**
 * App: 1.2 Deposit — `amount > 0`, leverage = current (grow net value at same L).
 **/
export const delayedDepositIntentSchema = z.object({
  type: z.literal("DEPOSIT"),
});
export type DelayedDepositIntent = z.infer<typeof delayedDepositIntentSchema>;

/**
 * App: 1.3 Deposit and Adjust leverage — `amount > 0`, leverage > current.
 **/
export const delayedDepositAndIncreaseLeverageIntentSchema = z.object({
  type: z.literal("DEPOSIT_AND_INCREASE_LEVERAGE"),
});
export type DelayedDepositAndIncreaseLeverageIntent = z.infer<
  typeof delayedDepositAndIncreaseLeverageIntentSchema
>;

/**
 * App: 2.1 Withdraw — withdraw selected token at fixed leverage.
 **/
export const delayedWithdrawCollateralIntentSchema = z.object({
  type: z.literal("WITHDRAW_COLLATERAL"),
  to: ZodAddress(),
  withdrawToken: ZodAddress(),
  withdrawAmount: z.bigint(),
});
export type DelayedWithdrawCollateralIntent = z.infer<
  typeof delayedWithdrawCollateralIntentSchema
>;

/**
 * App: 2.2 Withdraw — close account (receive leftover to wallet).
 **/
export const delayedCloseAccountIntentSchema = z.object({
  type: z.literal("CLOSE_ACCOUNT"),
  to: ZodAddress(),
});
export type DelayedCloseAccountIntent = z.infer<
  typeof delayedCloseAccountIntentSchema
>;

/**
 * App: 3.1 Add collateral — fixed debt.
 **/
export const delayedAddCollateralIntentSchema = z.object({
  type: z.literal("ADD_COLLATERAL"),
});
export type DelayedAddCollateralIntent = z.infer<
  typeof delayedAddCollateralIntentSchema
>;

/**
 * App: 4.2 Adjust leverage — lower leverage at fixed TVL.
 **/
export const delayedDecreaseLeverageIntentSchema = z.object({
  type: z.literal("DECREASE_LEVERAGE"),
});
export type DelayedDecreaseLeverageIntent = z.infer<
  typeof delayedDecreaseLeverageIntentSchema
>;

/**
 * Lean intent that is abi-encoded into `extraData` of a delayed withdrawal
 * request and decoded back when reading claimable withdrawals.
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
export type DelayedIntent = z.infer<typeof delayedIntentSchema>;

/**
 * Current version of the delayed intent encoding schema.
 * Bump when the layout of any intent type changes.
 **/
export const DELAYED_INTENT_VERSION = 1;

/**
 * Stable uint8 discriminants for intent types.
 * Starts at 1 so that all-zero data cannot decode as a valid intent.
 * Never reuse or renumber existing values.
 **/
export const DELAYED_INTENT_TYPES: Record<DelayedIntent["type"], number> = {
  INCREASE_LEVERAGE: 1,
  DEPOSIT: 2,
  DEPOSIT_AND_INCREASE_LEVERAGE: 3,
  WITHDRAW_COLLATERAL: 4,
  CLOSE_ACCOUNT: 5,
  ADD_COLLATERAL: 6,
  DECREASE_LEVERAGE: 7,
};

const HEADER_PARAMS = [
  { type: "uint8", name: "version" },
  { type: "uint8", name: "intentType" },
] as const;

const TO_PARAMS = [...HEADER_PARAMS, { type: "address", name: "to" }] as const;

const WITHDRAW_COLLATERAL_PARAMS = [
  ...TO_PARAMS,
  { type: "address", name: "withdrawToken" },
  { type: "uint256", name: "withdrawAmount" },
] as const;

/**
 * ABI-encodes a delayed intent as
 * `(uint8 version, uint8 intentType, ...intent-specific fields)`.
 * @throws if the intent does not match {@link delayedIntentSchema}
 **/
export function encodeDelayedIntent(intent: DelayedIntent): Hex {
  const parsed = delayedIntentSchema.parse(intent);
  const version = DELAYED_INTENT_VERSION;
  const intentType = DELAYED_INTENT_TYPES[parsed.type];
  switch (parsed.type) {
    case "INCREASE_LEVERAGE":
    case "CLOSE_ACCOUNT":
      return encodeAbiParameters(TO_PARAMS, [version, intentType, parsed.to]);
    case "WITHDRAW_COLLATERAL":
      return encodeAbiParameters(WITHDRAW_COLLATERAL_PARAMS, [
        version,
        intentType,
        parsed.to,
        parsed.withdrawToken,
        parsed.withdrawAmount,
      ]);
    case "DEPOSIT":
    case "DEPOSIT_AND_INCREASE_LEVERAGE":
    case "ADD_COLLATERAL":
    case "DECREASE_LEVERAGE":
      return encodeAbiParameters(HEADER_PARAMS, [version, intentType]);
    default: {
      const t: never = parsed;
      throw new Error(`unknown delayed intent: ${JSON.stringify(t)}`);
    }
  }
}

/**
 * Decodes a delayed intent from abi-encoded `extraData` and validates it
 * against {@link delayedIntentSchema}.
 * @throws if data is empty, has an unsupported version, an unknown intent
 * type, or does not match the schema
 **/
export function decodeDelayedIntent(data: Hex): DelayedIntent {
  const [version, intentType] = decodeAbiParameters(HEADER_PARAMS, data);
  if (version !== DELAYED_INTENT_VERSION) {
    throw new Error(`unsupported delayed intent version: ${version}`);
  }
  switch (intentType) {
    case DELAYED_INTENT_TYPES.INCREASE_LEVERAGE: {
      const [, , to] = decodeAbiParameters(TO_PARAMS, data);
      return delayedIntentSchema.parse({ type: "INCREASE_LEVERAGE", to });
    }
    case DELAYED_INTENT_TYPES.DEPOSIT:
      return { type: "DEPOSIT" };
    case DELAYED_INTENT_TYPES.DEPOSIT_AND_INCREASE_LEVERAGE:
      return { type: "DEPOSIT_AND_INCREASE_LEVERAGE" };
    case DELAYED_INTENT_TYPES.WITHDRAW_COLLATERAL: {
      const [, , to, withdrawToken, withdrawAmount] = decodeAbiParameters(
        WITHDRAW_COLLATERAL_PARAMS,
        data,
      );
      return delayedIntentSchema.parse({
        type: "WITHDRAW_COLLATERAL",
        to,
        withdrawToken,
        withdrawAmount,
      });
    }
    case DELAYED_INTENT_TYPES.CLOSE_ACCOUNT: {
      const [, , to] = decodeAbiParameters(TO_PARAMS, data);
      return delayedIntentSchema.parse({ type: "CLOSE_ACCOUNT", to });
    }
    case DELAYED_INTENT_TYPES.ADD_COLLATERAL:
      return { type: "ADD_COLLATERAL" };
    case DELAYED_INTENT_TYPES.DECREASE_LEVERAGE:
      return { type: "DECREASE_LEVERAGE" };
    default:
      throw new Error(`unknown delayed intent type: ${intentType}`);
  }
}

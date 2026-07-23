import type { Hex } from "viem";
import { decodeAbiParameters, encodeAbiParameters } from "viem";
import type { DelayedIntent } from "./types.js";

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
  { type: "address", name: "sourceToken" },
  { type: "uint256", name: "debtRepaid" },
] as const;

/**
 * ABI-encodes a delayed intent as
 * `(uint8 version, uint8 intentType, ...intent-specific fields)`.
 * @throws if the intent has an unknown type or fields that cannot be
 * abi-encoded (e.g. an invalid address)
 **/
export function encodeDelayedIntent(intent: DelayedIntent): Hex {
  const version = DELAYED_INTENT_VERSION;
  const intentType = DELAYED_INTENT_TYPES[intent.type];
  switch (intent.type) {
    case "CLOSE_ACCOUNT":
      return encodeAbiParameters(TO_PARAMS, [version, intentType, intent.to]);
    case "WITHDRAW_COLLATERAL":
      return encodeAbiParameters(WITHDRAW_COLLATERAL_PARAMS, [
        version,
        intentType,
        intent.to,
        intent.withdrawToken,
        intent.withdrawAmount,
        intent.sourceToken,
        intent.debtRepaid,
      ]);
    case "INCREASE_LEVERAGE":
    case "DEPOSIT":
    case "DEPOSIT_AND_INCREASE_LEVERAGE":
    case "ADD_COLLATERAL":
    case "DECREASE_LEVERAGE":
      return encodeAbiParameters(HEADER_PARAMS, [version, intentType]);
    default: {
      const t: never = intent;
      throw new Error(`unknown delayed intent: ${JSON.stringify(t)}`);
    }
  }
}

/**
 * Decodes a delayed intent from abi-encoded `extraData`.
 * @throws if data is empty, malformed, has an unsupported version,
 * or an unknown intent type
 **/
export function decodeDelayedIntent(data: Hex): DelayedIntent {
  const [_version, intentType] = decodeAbiParameters(HEADER_PARAMS, data);
  // if (version !== DELAYED_INTENT_VERSION) {
  //   throw new Error(`unsupported delayed intent version: ${version}`);
  // }
  switch (intentType) {
    case DELAYED_INTENT_TYPES.INCREASE_LEVERAGE:
      return { type: "INCREASE_LEVERAGE" };
    case DELAYED_INTENT_TYPES.DEPOSIT:
      return { type: "DEPOSIT" };
    case DELAYED_INTENT_TYPES.DEPOSIT_AND_INCREASE_LEVERAGE:
      return { type: "DEPOSIT_AND_INCREASE_LEVERAGE" };
    case DELAYED_INTENT_TYPES.WITHDRAW_COLLATERAL: {
      const [, , to, withdrawToken, withdrawAmount, sourceToken, debtRepaid] =
        decodeAbiParameters(WITHDRAW_COLLATERAL_PARAMS, data);
      return {
        type: "WITHDRAW_COLLATERAL",
        to,
        withdrawToken,
        withdrawAmount,
        sourceToken,
        debtRepaid,
      };
    }
    case DELAYED_INTENT_TYPES.CLOSE_ACCOUNT: {
      const [, , to] = decodeAbiParameters(TO_PARAMS, data);
      return { type: "CLOSE_ACCOUNT", to };
    }
    case DELAYED_INTENT_TYPES.ADD_COLLATERAL:
      return { type: "ADD_COLLATERAL" };
    case DELAYED_INTENT_TYPES.DECREASE_LEVERAGE:
      return { type: "DECREASE_LEVERAGE" };
    default:
      throw new Error(`unknown delayed intent type: ${intentType}`);
  }
}

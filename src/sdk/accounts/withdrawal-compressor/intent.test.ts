import type { Address, Hex } from "viem";
import { encodeAbiParameters, hexToNumber, slice } from "viem";
import { describe, expect, it } from "vitest";
import {
  DELAYED_INTENT_TYPES,
  DELAYED_INTENT_VERSION,
  type DelayedIntent,
  decodeDelayedIntent,
  delayedIntentSchema,
  encodeDelayedIntent,
} from "./intent.js";

const TO: Address = "0xC78CF21A0f92929aC34ee86Cf94C15c9EE224adE";
const TOKEN: Address = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";

/**
 * All intents are encoded as head-only (static) params,
 * so version and type are simply the first two 32-byte words.
 **/
function getEnvelope(data: Hex): { version: number; intentType: number } {
  return {
    version: hexToNumber(slice(data, 0, 32)),
    intentType: hexToNumber(slice(data, 32, 64)),
  };
}

describe("encodeDelayedIntent/decodeDelayedIntent", () => {
  const cases: DelayedIntent[] = [
    { type: "INCREASE_LEVERAGE", to: TO },
    { type: "DEPOSIT" },
    { type: "DEPOSIT_AND_INCREASE_LEVERAGE" },
    {
      type: "WITHDRAW_COLLATERAL",
      to: TO,
      withdrawToken: TOKEN,
      withdrawAmount: 123456789012345678901234567890n,
    },
    { type: "CLOSE_ACCOUNT", to: TO },
    { type: "ADD_COLLATERAL" },
    { type: "DECREASE_LEVERAGE" },
  ];

  it.each(cases)("round-trips $type", intent => {
    const encoded = encodeDelayedIntent(intent);
    expect(getEnvelope(encoded)).toEqual({
      version: DELAYED_INTENT_VERSION,
      intentType: DELAYED_INTENT_TYPES[intent.type],
    });
    expect(decodeDelayedIntent(encoded)).toEqual(intent);
  });

  it("throws on unsupported version", () => {
    const encoded = encodeAbiParameters(
      [{ type: "uint8" }, { type: "uint8" }],
      [DELAYED_INTENT_VERSION + 1, DELAYED_INTENT_TYPES.DEPOSIT],
    );
    expect(() => decodeDelayedIntent(encoded)).toThrow();
  });

  it("throws on unknown intent type", () => {
    const encoded = encodeAbiParameters(
      [{ type: "uint8" }, { type: "uint8" }],
      [DELAYED_INTENT_VERSION, 255],
    );
    expect(() => decodeDelayedIntent(encoded)).toThrow();
  });

  it("throws on all-zero data", () => {
    expect(() => decodeDelayedIntent(`0x${"00".repeat(64)}`)).toThrow();
  });

  it("throws on empty and malformed data", () => {
    expect(() => decodeDelayedIntent("0x")).toThrow();
    expect(() => decodeDelayedIntent("0x01")).toThrow();
    // valid header for WITHDRAW_COLLATERAL, but fields are missing
    const truncated = encodeAbiParameters(
      [{ type: "uint8" }, { type: "uint8" }],
      [DELAYED_INTENT_VERSION, DELAYED_INTENT_TYPES.WITHDRAW_COLLATERAL],
    );
    expect(() => decodeDelayedIntent(truncated)).toThrow();
  });

  it("throws when encoding an intent with an invalid address", () => {
    expect(() =>
      encodeDelayedIntent({
        type: "CLOSE_ACCOUNT",
        to: "0xnotanaddress" as Address,
      }),
    ).toThrow();
  });

  it("throws when encoding an intent with missing fields", () => {
    expect(() =>
      encodeDelayedIntent({ type: "WITHDRAW_COLLATERAL" } as DelayedIntent),
    ).toThrow();
    expect(() =>
      encodeDelayedIntent({
        type: "WITHDRAW_COLLATERAL",
        to: TO,
        withdrawToken: TOKEN,
        // biome-ignore lint/suspicious/noExplicitAny: intentionally invalid
        withdrawAmount: "123" as any,
      }),
    ).toThrow();
  });

  it("throws when encoding an intent with an unknown type", () => {
    expect(() =>
      encodeDelayedIntent({ type: "UNKNOWN" } as unknown as DelayedIntent),
    ).toThrow();
  });
});

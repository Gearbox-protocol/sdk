import { decodeAbiParameters } from "viem";
import type { BaseParams } from "../../onchain/index.js";
import type { BotParameters } from "./types.js";

export default function deserializePartialLiquidationBotParams(
  params: Pick<BaseParams, "serializedParams">,
): BotParameters {
  const [
    treasury,
    minHealthFactor,
    maxHealthFactor,
    premiumScaleFactor,
    feeScaleFactor,
  ] = decodeAbiParameters(
    [
      { name: "treasury", type: "address" },
      { name: "minHealthFactor", type: "uint16" },
      { name: "maxHealthFactor", type: "uint16" },
      { name: "premiumScaleFactor", type: "uint16" },
      { name: "feeScaleFactor", type: "uint16" },
    ],
    params.serializedParams,
  );
  return {
    treasury,
    minHealthFactor,
    maxHealthFactor,
    premiumScaleFactor,
    feeScaleFactor,
  };
}

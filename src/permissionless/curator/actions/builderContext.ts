import type { Address } from "viem";
import { parseUnits } from "viem";
import type { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import { numberToDecimalString } from "../utils/numberToDecimalString.js";

/** Dependencies needed while turning a GIP action into a transaction. **/
export interface GipBuilderContext {
  client: MarketConfiguratorContract["client"];
  marketConfigurator: MarketConfiguratorContract;
  tokens: {
    decimals(token: Address): number;
  };
  gasLimit?: bigint;
}

export function convertTokenAmount(args: {
  tokens: GipBuilderContext["tokens"];
  token: Address;
  amount: number;
}): bigint {
  return parseUnits(
    numberToDecimalString(args.amount),
    args.tokens.decimals(args.token),
  );
}

/** Converts a human-scale amount of the market's underlying to raw units. **/
export function convertUnderlyingAmount(
  ctx: Pick<GipBuilderContext, "tokens">,
  state: { underlyingAsset: Address },
  amount: number,
): bigint {
  return convertTokenAmount({
    tokens: ctx.tokens,
    token: state.underlyingAsset,
    amount,
  });
}

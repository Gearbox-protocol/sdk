import type { Address } from "viem";
import { parseUnits } from "viem";
import type { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import { numberToDecimalString } from "../utils/numberToDecimalString.js";
import { DECIMAL_STRING } from "../validationSchemas.js";

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
  amount: number | string;
}): bigint {
  const decimals = args.tokens.decimals(args.token);
  const decimal =
    typeof args.amount === "number"
      ? numberToDecimalString(args.amount)
      : args.amount;
  if (!DECIMAL_STRING.test(decimal))
    throw new Error("Token amounts must be nonnegative decimal values");
  const fraction = decimal.split(".")[1]?.replace(/0+$/, "") ?? "";
  if (fraction.length > decimals)
    throw new Error(
      `Amount ${decimal} has more than ${decimals} token decimals`,
    );
  return parseUnits(decimal, decimals);
}

/** Converts a human-scale amount of the market's underlying to raw units. **/
export function convertUnderlyingAmount(
  ctx: Pick<GipBuilderContext, "tokens">,
  state: { underlyingAsset: Address },
  amount: number | string,
): bigint {
  return convertTokenAmount({
    tokens: ctx.tokens,
    token: state.underlyingAsset,
    amount,
  });
}

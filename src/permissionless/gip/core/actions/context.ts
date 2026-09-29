import type { Address } from "viem";
import { parseUnits } from "viem";
import type { MarketConfiguratorContract } from "../../../index.js";

/** Dependencies needed while turning a GIP action into a transaction. */
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
  return parseUnits(args.amount.toString(), args.tokens.decimals(args.token));
}

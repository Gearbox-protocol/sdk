import type { Address } from "viem";
import type { GipBuilderContext } from "../actions/context.js";
import { convertTokenAmount } from "../actions/context.js";
import type { CreateCreditSuiteAction } from "../actions/market-create-credit-suite.js";

export async function previewCreditSuiteAddress(args: {
  ctx: GipBuilderContext;
  action: CreateCreditSuiteAction;
  market: {
    address: Address;
    name: string;
    symbol: string;
    underlyingAsset: Address;
  };
  minorVersion: number;
}): Promise<Address> {
  const { ctx, action, market, minorVersion } = args;
  return (
    await ctx.marketConfigurator.createCreditSuite(
      {
        pool: market.address,
        name: market.name,
        symbol: market.symbol,
        underlyingAsset: market.underlyingAsset,
        minorVersion,
      },
      {
        params: {
          ...action.params,
          minDebt: convertTokenAmount({
            tokens: ctx.tokens,
            token: market.underlyingAsset,
            amount: action.params.minDebt,
          }),
          maxDebt: convertTokenAmount({
            tokens: ctx.tokens,
            token: market.underlyingAsset,
            amount: action.params.maxDebt,
          }),
        },
      },
    )
  ).creditManager;
}

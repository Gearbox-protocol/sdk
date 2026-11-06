import type { Address } from "viem";
import type { GipBuilderContext } from "../actions/builderContext.js";
import {
  type CreateCreditSuiteAction,
  createCreditSuite,
} from "../actions/createCreditSuiteActionData.js";

/** Address of the credit manager a `MARKET::createCreditSuite` action deploys. **/
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
  const { creditManager } = await createCreditSuite({
    ctx,
    market: { ...market, minorVersion },
    params: action.params,
  });
  return creditManager;
}

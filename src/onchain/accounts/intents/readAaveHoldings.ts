import { type Address, erc20Abi } from "viem";
import { unsupportedCollateralToken } from "../../../model/index.js";
import type { OnchainSDK } from "../../index.js";
import { iAaveV3PoolAbi } from "../../market/adapters/abi/aave/index.js";
import { AaveV3PoolAdapterContract } from "../../market/adapters/contracts/AaveV3PoolAdapterContract.js";
import { toToken } from "../../validation/helpers/token.js";
import { IntentPreviewError } from "../../validation/raise.js";
import type { AaveHoldings } from "./types.js";

/**
 * What `owner` holds and owes on the Aave pool the credit manager supplies
 * `token` to: its aTokens of `token`, and its variable debt in the asset the
 * Horizon bridge lends there — the underlying, or the asset an RWA underlying
 * wraps.
 *
 * Refused with `unsupportedCollateralToken` when no Aave pool adapter of the
 * credit manager lists `token`.
 */
export async function readAaveHoldings(
  sdk: OnchainSDK,
  creditManager: Address,
  owner: Address,
  token: Address,
): Promise<AaveHoldings> {
  const suite = sdk.marketRegister.findCreditManager(creditManager);
  const adapter = suite.creditManager.adapters
    .values()
    .find(
      (a): a is AaveV3PoolAdapterContract =>
        a instanceof AaveV3PoolAdapterContract && a.isAssetAllowed(token),
    );
  if (!adapter) {
    throw new IntentPreviewError(
      unsupportedCollateralToken(toToken(sdk, token)),
      `readAaveHoldings: no Aave pool adapter lists ${token}`,
    );
  }
  const underlying = suite.underlying;
  const debtToken =
    sdk.tokensMeta.rwaUnderlyings.get(underlying)?.asset ?? underlying;
  const [aToken, reserve] = await Promise.all([
    adapter.aToken(token),
    sdk.client.readContract({
      address: adapter.pool,
      abi: iAaveV3PoolAbi,
      functionName: "getReserveData",
      args: [debtToken],
    }),
  ]);
  const [supplied, owed] = await sdk.client.multicall({
    contracts: [
      {
        address: aToken,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [owner],
      },
      {
        address: reserve.variableDebtTokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [owner],
      },
    ],
    allowFailure: false,
    batchSize: 0,
  });
  return {
    aToken,
    debtToken,
    supplied,
    owed,
    borrowRate: reserve.currentVariableBorrowRate,
  };
}

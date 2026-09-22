import assert from "node:assert/strict";
import { type Address, parseEventLogs } from "viem";
import { iCreditFacadeV310Abi } from "../../abi/310/generated.js";
import type { StrategyOpportunityKey } from "../../model/index.js";
import type { Asset } from "../../onchain/index.js";
import type { GearboxSDK } from "../../sdk/index.js";
import type { AnvilAccountEnvironment } from "../AnvilAccountEnvironment.js";
import { prepared } from "./prepared.js";

interface SetupPositionOptions {
  sdk: GearboxSDK<"onchain">;
  environment: AnvilAccountEnvironment;
  key: StrategyOpportunityKey;
  collateral: Asset;
  target: Address;
  leverage: bigint;
  slippage: number;
  creditAccount?: Address;
}

/**
 * Opens the starting position through the public SDK API as a setup operation.
 * Funding and KYC must already be prepared within the journey's snapshot.
 * `creditAccount` reuses an empty account created for account-level KYC.
 */
export async function openSetupPosition(options: SetupPositionOptions) {
  const { sdk, environment, key, collateral, target, leverage, slippage } =
    options;
  const { borrower } = environment;
  const data = prepared(
    await sdk.opportunities.prepare.openNewStrategy(key, {
      collateral: [collateral],
      leverage,
      slippage,
      targetToken: target,
      ...(options.creditAccount
        ? { creditAccount: options.creditAccount }
        : {}),
    }),
  );
  const calls = await environment.decorateOpenCalls(
    key.creditManager,
    data.state.calls,
  );
  const tx = await sdk.opportunities.execute.buildTx({
    kind: "open",
    ...key,
    wallet: borrower.address,
    sim: { ok: true, data: { ...data, state: { ...data.state, calls } } },
    collateral: [collateral],
    ethAmount: 0n,
    targetToken: target,
    signaturesToCache: await environment.signRwaRequirements(
      key.creditManager,
      target,
    ),
  });
  const { hash, receipt } = await environment.sendAndConfirm(
    tx,
    borrower,
    "setup: open position",
  );
  const logs = parseEventLogs({
    abi: iCreditFacadeV310Abi,
    logs: receipt.logs,
    eventName: "OpenCreditAccount",
  });
  if (options.creditAccount) {
    assert.equal(
      logs.length,
      0,
      "Setup must use the prepared account without opening another",
    );
  } else {
    assert.equal(logs.length, 1, "Setup must emit exactly one account event");
  }
  return {
    creditAccount: options.creditAccount ?? logs[0].args.creditAccount,
    transactions: [hash],
  };
}

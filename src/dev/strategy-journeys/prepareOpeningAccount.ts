import assert from "node:assert/strict";
import { type Address, parseEventLogs } from "viem";
import { iCreditFacadeV310Abi } from "../../abi/310/generated.js";
import type { StrategyOpportunityKey } from "../../model/index.js";
import type { GearboxSDK } from "../../sdk/index.js";
import type { AnvilAccountEnvironment } from "../AnvilAccountEnvironment.js";
import { prepared } from "./prepared.js";
import type { JourneyAccountSetup } from "./types.js";

/** Creates only the empty, registered account required by permissioned Midas. */
export async function prepareOpeningAccount({
  sdk,
  environment,
  key,
  target,
}: {
  sdk: GearboxSDK<"onchain">;
  environment: AnvilAccountEnvironment;
  key: StrategyOpportunityKey;
  target: Address;
}): Promise<JourneyAccountSetup | undefined> {
  const kycTarget = { creditManager: key.creditManager, target };
  if (!(await environment.requiresAccountKyc(kycTarget))) return undefined;

  const data = prepared(
    await sdk.opportunities.prepare.openEmptyCreditAccount(key),
  );
  const tx = await sdk.opportunities.execute.buildTx({
    kind: "openEmpty",
    ...key,
    wallet: environment.borrower.address,
    sim: { ok: true, data },
  });
  const { hash, receipt } = await environment.sendAndConfirm(
    tx,
    environment.borrower,
    "setup: open empty account for KYC",
  );
  const logs = parseEventLogs({
    abi: iCreditFacadeV310Abi,
    logs: receipt.logs,
    eventName: "OpenCreditAccount",
  });
  assert.equal(
    logs.length,
    1,
    "Empty opening must emit exactly one account event",
  );
  const creditAccount = logs[0].args.creditAccount;
  await environment.grantCreditAccountKyc(creditAccount, kycTarget);
  await environment.sync();
  return { creditAccount, transactions: [hash] };
}

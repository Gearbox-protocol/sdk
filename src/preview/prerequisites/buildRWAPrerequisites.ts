import type { Address } from "viem";

import { AddressSet, type RWAOperationArgs } from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";
import type { AnyPrerequisite } from "./Prerequisite.js";
import { RWAOpenRequirementsPrerequisite } from "./RWAOpenRequirementsPrerequisite.js";
import type { PrerequisiteContext } from "./types.js";

/**
 * For RWA-factory open-account operations (e.g. `RWAOpenCreditAccount`),
 * builds a prerequisite per RWA token the multicall touches; each one checks
 * the factory's open-account requirements (issuer-side token registration,
 * EIP-712 signatures) at verify time.
 *
 * The `providedArgs` params are the registration values decoded from the
 * transaction calldata itself: signatures already included there satisfy the
 * signature requirement, so a fully built transaction is not reported as
 * missing signatures. In the template flow they are empty and the verified
 * result's `detail.missing` describes what is still unfulfilled; acting on it
 * (signing, rebuilding calldata) is up to the consumer.
 *
 * Returns nothing for non-RWA markets.
 */
export function buildRWAPrerequisites(
  multicall: InnerOperation[],
  creditManager: Address,
  providedArgs: RWAOperationArgs,
  ctx: PrerequisiteContext,
): AnyPrerequisite[] {
  const { rwaFactory } =
    ctx.sdk.marketRegister.findByCreditManager(creditManager);
  if (!rwaFactory) {
    return [];
  }

  const rwaTokens = new AddressSet(rwaFactory.getTokens());
  const candidates = new AddressSet();
  for (const op of multicall) {
    if (op.operation === "AddCollateral" || op.operation === "UpdateQuota") {
      candidates.add(op.token);
    }
  }

  const prereqs: AnyPrerequisite[] = [];
  for (const token of candidates) {
    if (!rwaTokens.has(token)) {
      continue;
    }
    prereqs.push(
      new RWAOpenRequirementsPrerequisite(
        {
          token,
          creditManager,
          factory: rwaFactory.address,
        },
        providedArgs,
      ),
    );
  }
  return prereqs;
}

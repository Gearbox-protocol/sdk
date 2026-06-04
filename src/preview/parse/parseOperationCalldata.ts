import type { Address, Hex } from "viem";
import {
  CreditFacadeV310Contract,
  type PluginsMap,
  PoolV310Contract,
} from "../../sdk/index.js";
import { UnsupportedTargetError } from "./errors.js";
import { parseFacadeOperationCalldata } from "./parseFacadeOperationCalldata.js";
import { parsePoolOperationCalldata } from "./parsePoolOperationCalldata.js";
import type { Operation, SdkWithAdapters } from "./types.js";

export interface ParseOperationCalldataInput<
  P extends PluginsMap = PluginsMap,
> {
  /**
   * Already-attached SDK; chain, RPC and block are baked in at attach time.
   * Must be created with the adapters plugin (enforced at compile time) so
   * adapter contracts resolve during multicall classification.
   */
  sdk: SdkWithAdapters<P>;
  to: Address;
  calldata: Hex;
  /** Transaction sender, contextual only. */
  sender: Address;
}

/**
 * Decodes raw operation calldata into an {@link Operation}.
 *
 * Routes by the resolved contract at `to`: a pool yields a deposit/redeem
 * operation, a credit facade yields one facade operation. Anything else throws
 * {@link UnsupportedTargetError}.
 */
export function parseOperationCalldata<P extends PluginsMap>(
  input: ParseOperationCalldataInput<P>,
): Operation {
  const { sdk, to, calldata } = input;
  const contract = sdk.getContract(to);

  if (contract instanceof PoolV310Contract) {
    return parsePoolOperationCalldata({ sdk, pool: contract, calldata });
  }

  if (contract instanceof CreditFacadeV310Contract) {
    return parseFacadeOperationCalldata({
      sdk,
      facade: contract,
      calldata,
    });
  }

  throw new UnsupportedTargetError(to);
}

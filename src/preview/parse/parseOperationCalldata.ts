import type { Address, Hex } from "viem";
import {
  CreditFacadeV310Contract,
  type PluginsMap,
  PoolV310Contract,
  SecuritizeRWAFactory,
  ZapperContract,
} from "../../sdk/index.js";
import { UnsupportedTargetError } from "./errors.js";
import { parseFacadeOperationCalldata } from "./parseFacadeOperationCalldata.js";
import { parsePoolOperationCalldata } from "./parsePoolOperationCalldata.js";
import { parseRWAFactoryOperationCalldata } from "./parseRWAFactoryOperationCalldata.js";
import type { Operation, SdkWithAdapters } from "./types.js";
import type { PoolOperation } from "./types-pools.js";

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
  /** Transaction `msg.value`, required for native-token zapper deposits. */
  value?: bigint;
}

/**
 * Decodes raw operation calldata into an {@link Operation}.
 *
 * Support parsing of pool operations (including via zappers) and credit facade operations.
 */
export function parseOperationCalldata<P extends PluginsMap>(
  input: ParseOperationCalldataInput<P>,
): Operation {
  const { sdk, to, calldata, value, sender } = input;
  const contract = sdk.getContract(to);

  if (contract instanceof PoolV310Contract) {
    return parsePoolOperationCalldata({ sdk, pool: contract, calldata });
  }

  if (contract instanceof ZapperContract) {
    const parsed = contract.parseOperation(calldata, value);
    if (parsed.operation === "Deposit") {
      const op: PoolOperation = {
        operation: "Deposit",
        pool: parsed.pool,
        receiver: parsed.receiver,
        assets: parsed.assets,
        underlying: parsed.underlying,
        tokenIn: parsed.token,
        zapper: parsed.zapper,
        referralCode: parsed.referralCode,
      };
      return op;
    }
    const op: PoolOperation = {
      operation: "Redeem",
      pool: parsed.pool,
      receiver: parsed.receiver,
      // The zapper burns the caller's pool shares, so the share owner is the
      // transaction sender.
      owner: sender,
      shares: parsed.shares,
      underlying: parsed.underlying,
      tokenOut: parsed.token,
      zapper: parsed.zapper,
    };
    return op;
  }

  if (contract instanceof CreditFacadeV310Contract) {
    return parseFacadeOperationCalldata({
      sdk,
      facade: contract,
      calldata,
    });
  }

  if (contract instanceof SecuritizeRWAFactory) {
    return parseRWAFactoryOperationCalldata({
      sdk,
      factory: contract,
      calldata,
    });
  }

  throw new UnsupportedTargetError(to);
}

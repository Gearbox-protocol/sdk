import {
  CreditFacadeV310Contract,
  isRWAFactory,
  type PluginsMap,
  PoolV310Contract,
  ZapperContract,
} from "../../sdk/index.js";
import type { PreviewOperationInput } from "../types.js";
import { UnsupportedTargetError } from "./errors.js";
import { parseFacadeOperationCalldata } from "./parseFacadeOperationCalldata.js";
import { parsePoolOperationCalldata } from "./parsePoolOperationCalldata.js";
import { parseRWAFactoryOperationCalldata } from "./parseRWAFactoryOperationCalldata.js";
import type { Operation } from "./types.js";
import type { PoolOperation } from "./types-pools.js";

/**
 * Decodes raw operation calldata into an {@link Operation}.
 *
 * Support parsing of pool operations (including via zappers),
 * credit facade operations and RWA factory operations.
 */
export function parseOperationCalldata<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
): Operation {
  const { sdk, to, calldata, value, sender } = input;
  const contract = sdk.getContract(to);

  if (contract instanceof PoolV310Contract) {
    return parsePoolOperationCalldata(sdk, contract, calldata);
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
        tokenIn: contract.tokenIn.addr,
        tokenOut: contract.tokenOut.addr,
        zapper: parsed.zapper,
        referralCode: parsed.referralCode,
      };
      return op;
    }
    const op: PoolOperation = {
      operation: "Redeem",
      pool: parsed.pool,
      receiver: parsed.receiver,
      // The zapper burns the caller's share tokens, so the share owner is the
      // transaction sender.
      owner: sender,
      shares: parsed.shares,
      underlying: parsed.underlying,
      tokenIn: contract.tokenOut.addr,
      tokenOut: contract.tokenIn.addr,
      zapper: parsed.zapper,
    };
    return op;
  }

  if (contract instanceof CreditFacadeV310Contract) {
    return parseFacadeOperationCalldata(sdk, contract, calldata);
  }

  if (contract && isRWAFactory(contract)) {
    return parseRWAFactoryOperationCalldata(sdk, contract, calldata);
  }

  throw new UnsupportedTargetError(to);
}

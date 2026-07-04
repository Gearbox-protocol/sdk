import type { Address, Hex } from "viem";
import {
  AbstractAdapterContract,
  copyBalances,
} from "../../plugins/adapters/index.js";
import {
  AddressMap,
  AP_WETH_TOKEN,
  type Asset,
  CreditFacadeV310BaseContract,
  hexEq,
  type MultiCall,
  NO_VERSION,
  type ParsedCallV2,
  type PluginsMap,
  SecuritizeRWAFactory,
} from "../../sdk/index.js";
import type {
  InnerOperation,
  OpenCreditAccountOperation,
  SecuritizeOpenCreditAccountOperation,
} from "../parse/index.js";
import { extractExpectedBalanceChanges } from "./extractExpectedBalanceChanges.js";
import type {
  OpenCreditAccountPreview,
  PreviewOperationInput,
} from "./types.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

export function previewOpenCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: OpenCreditAccountOperation | SecuritizeOpenCreditAccountOperation,
): OpenCreditAccountPreview {
  const { sdk, to, calldata, value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  const collateralByToken = new AddressMap<Asset>();
  // Balances resulting from the facade operations themselves; the router's
  // expected-balance deltas are applied on top of these.
  const balances = new AddressMap<bigint>();
  const addBalance = (token: string, amount: bigint): void => {
    balances.upsert(token, (balances.get(token) ?? 0n) + amount);
  };
  let debt = 0n;
  const quotas: Asset[] = [];
  for (const op of operation.multicall) {
    switch (op.operation) {
      case "AddCollateral": {
        const balance = collateralByToken.get(op.token)?.balance ?? 0n;
        collateralByToken.upsert(op.token, {
          token: op.token,
          balance: balance + op.amount,
        });
        addBalance(op.token, op.amount);
        break;
      }
      case "WithdrawCollateral":
        addBalance(op.token, -op.amount);
        break;
      case "IncreaseBorrowedAmount":
        debt += op.amount;
        addBalance(op.token, op.amount);
        break;
      case "DecreaseBorrowedAmount":
        debt -= op.amount;
        addBalance(op.token, -op.amount);
        break;
      case "UpdateQuota":
        quotas.push({ token: op.token, balance: op.change });
        break;
    }
  }
  let collateral = collateralByToken.values();
  // collateral value is computed before unwrapping since the oracle cannot
  // price the native token
  const collateralValue = collateral.reduce(
    (acc, { token, balance }) =>
      acc + market.priceOracle.convert(token, market.underlying, balance),
    0n,
  );
  collateral = unwrapNativeCollateral(
    collateral,
    value,
    sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
  );

  // Since we open an account, initial balances are all zero, so balances at
  // `storeExpectedBalances` time are exactly the ones produced by the facade
  // operations above. Every router-generated call between the
  // `storeExpectedBalances`/`compareBalances` pair is diff-style: it spends
  // the consumed token down to the exact leftover encoded in its calldata.
  // Threading balances through each adapter yields the final leftovers of all
  // consumed tokens, while the target token minimum is declared by the
  // `storeExpectedBalances` deltas (enforced by `compareBalances`).
  const parsed = sdk.parseFunctionDataV2(to, calldata);
  const innerCalls = (parsed.rawArgs.calls ?? []) as ParsedCallV2[];
  const expected = extractExpectedBalanceChanges(innerCalls);
  let finalBalances = balances;
  if (expected) {
    // Adapters need the still-encoded inner calldata (parseFunctionDataV2
    // erases argument types), so recover the raw multicall structs; they are
    // index-aligned with innerCalls since parseMultiCallV2 is a 1:1 map.
    const rawCalls = extractRawInnerCalls(sdk, to, calldata);
    if (rawCalls.length !== innerCalls.length) {
      throw new Error(
        `raw and parsed inner calls of ${to} are misaligned: ${rawCalls.length} raw vs ${innerCalls.length} parsed`,
      );
    }
    const snapshot = copyBalances(balances);
    for (let i = expected.startIndex + 1; i < expected.endIndex; i++) {
      const call = rawCalls[i];
      const adapter = sdk.getContract(call.target);
      if (!(adapter instanceof AbstractAdapterContract)) {
        throw new Error(
          `call to ${call.target} between storeExpectedBalances and compareBalances is not an adapter call`,
        );
      }
      finalBalances = adapter.previewBalanceChanges(
        finalBalances,
        call.callData,
      );
    }
    for (const { token, balance } of expected.deltas) {
      finalBalances.upsert(token, (snapshot.get(token) ?? 0n) + balance);
    }
  }

  // filter out dust, including the 1-wei leftovers of drained inputs and
  // intermediate tokens
  const assets: Asset[] = finalBalances
    .entries()
    .filter(([, balance]) => balance > 1n)
    .map(([token, balance]) => ({ token, balance }));

  return {
    operation: operation.operation,
    target: inferTargetAsset(operation.multicall, finalBalances),
    collateral,
    collateralValue,
    debt,
    quotas,
    assets,
  };
}

/**
 * Recovers the raw inner multicall structs (with still-ABI-encoded per-call
 * `callData`) from the entry-point calldata. `to` must be a credit facade or a
 * supported RWA factory.
 */
function extractRawInnerCalls<P extends PluginsMap>(
  sdk: PreviewOperationInput<P>["sdk"],
  to: Address,
  calldata: Hex,
): MultiCall[] {
  const entry = sdk.getContract(to);
  if (
    entry instanceof CreditFacadeV310BaseContract ||
    entry instanceof SecuritizeRWAFactory
  ) {
    return entry.extractRawInnerCalls(calldata);
  }
  throw new Error(
    `cannot extract raw inner calls from ${to}: neither a credit facade nor a supported RWA factory`,
  );
}

/**
 * Infers the strategy target token of an account opening: the first quoted
 * token (first `UpdateQuota` with a positive change), with its balance taken
 * from the computed assets. Returns `undefined` when nothing is quoted.
 */
function inferTargetAsset(
  multicall: InnerOperation[],
  balances: AddressMap<bigint>,
): Asset | undefined {
  for (const op of multicall) {
    if (op.operation === "UpdateQuota" && op.change > 0n) {
      const balance = balances.get(op.token);
      return balance ? { token: op.token, balance } : undefined;
    }
  }
  return undefined;
}

import {
  AddressMap,
  AP_WETH_TOKEN,
  type Asset,
  NO_VERSION,
  type ParsedCallV2,
  type PluginsMap,
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

  // Since we open an account, initial balances are all zero and the router's
  // `storeExpectedBalances` deltas reflect the minimal amounts of assets on
  // the account after opening (relative to the balances produced by the
  // facade operations above).
  const parsed = sdk.parseFunctionDataV2(to, calldata);
  const innerCalls = (parsed.rawArgs.calls ?? []) as ParsedCallV2[];
  const deltas = extractExpectedBalanceChanges(innerCalls) ?? [];
  for (const { token, balance } of deltas) {
    addBalance(token, balance);
  }

  // filter out dust
  const assets: Asset[] = balances
    .entries()
    .filter(([, balance]) => balance > 1n)
    .map(([token, balance]) => ({ token, balance }));

  return {
    operation: operation.operation,
    target: inferTargetAsset(operation.multicall, balances),
    collateral,
    collateralValue,
    debt,
    quotas,
    assets,
  };
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

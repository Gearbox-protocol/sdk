import {
  type Address,
  decodeFunctionData,
  type Hex,
  isAddressEqual,
} from "viem";
import { iCreditFacadeMulticallV310Abi } from "../../../abi/310/generated.js";
import type { Bps } from "../../../model/index.js";
import {
  MAX_UINT256,
  MIN_INT96,
  PERCENTAGE_FACTOR,
} from "../../constants/math.js";
import { classifyAdapterSafePrices } from "../../market/adapters/safe-prices.js";
import type { IAdapterContract } from "../../market/adapters/types.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { calcHealthFactor } from "../../positions/calcHealthFactor.js";
import type { AccountSnapshot } from "../../positions/types.js";
import type { MultiCall } from "../../types/transactions.js";
import { AddressMap } from "../../utils/AddressMap.js";
import {
  checkCollateralised,
  MIN_HEALTH_FACTOR_FACADE,
} from "../../validation/checks.js";
import {
  IntentPreviewError,
  type PreviewIssue,
} from "../../validation/refusal.js";
import { toToken } from "../../validation/token.js";
import type { CreditAccountSlice } from "./types.js";

export interface ExecutionConstraint {
  id:
    | "callPricing"
    | "forbiddenTokens"
    | "collateral"
    | "quota"
    | "poolLiquidity";
  status: "passed" | "failed" | "unresolved" | "notApplicable";
  issue?: PreviewIssue;
  /** Comparable values use the named unit; collateral ratios are basis points. */
  actual?: number;
  required?: number;
  unit?: "bps";
}

/** Operation checks, separate from display metrics. Undefined pricing is unresolved. */
export interface ExecutionConstraintReport {
  checkCollateral: boolean;
  useSafePrices: boolean | undefined;
  revertOnForbiddenTokens: boolean | undefined;
  minHealthFactor: Bps;
  /** Capped at minHealthFactor after the contract's lazy check has passed. */
  checkedHealthFactor?: Bps;
  constraints: ExecutionConstraint[];
}

type EntryPoint = "multicall" | "openCreditAccount" | "closeCreditAccount";
type Range = { min: bigint; max: bigint };

export interface MulticallConstraintsProps {
  sdk: OnchainSDK;
  creditAccount: CreditAccountSlice;
  calls: readonly MultiCall[];
  /** Outer method, not an intent label such as WITHDRAW/closeAll. */
  entryPoint?: EntryPoint;
}

/**
 * CreditFacadeV3._multicall (core-v3 510fc65): adapter true accumulates both
 * flags; increaseDebt only forbids tokens. Actual close skips final checks,
 * but zero-debt multicall still checks forbidden tokens. Balance bounds come
 * from calldata and compareBalances, never expected router quotes.
 */
export function inspectMulticall({
  sdk,
  creditAccount: ca,
  calls,
  entryPoint = "multicall",
}: MulticallConstraintsProps): ExecutionConstraintReport & {
  enabledTokensMask: bigint;
  collateralHints: bigint[];
  balanceOf: (token: Address) => Range;
} {
  const suite = sdk.marketRegister.findCreditManager(ca.creditManager);
  const tokens = suite.creditManager.collateralTokens;
  const forbidden = new Set(suite.forbiddenTokens.map(t => t.toLowerCase()));
  const report: ReturnType<typeof inspectMulticall> = {
    checkCollateral: entryPoint !== "closeCreditAccount",
    useSafePrices: false,
    revertOnForbiddenTokens: false,
    minHealthFactor: MIN_HEALTH_FACTOR_FACADE,
    constraints: [],
    enabledTokensMask:
      entryPoint === "openCreditAccount" ? 1n : ca.enabledTokensMask,
    collateralHints: [],
    balanceOf: token => balanceOf(token),
  };
  const balances = new AddressMap<Range>(
    ca.tokens.map(t => [t.token, { min: t.balance, max: t.balance }]),
  );
  const quotas = new AddressMap<bigint>(ca.tokens.map(t => [t.token, t.quota]));
  const quotaTotals = new AddressMap<bigint>();
  let externalCallSeen = false;
  let pendingBounds: Array<{ token: Address; min: bigint }> | undefined;
  const unresolved: PreviewIssue[] = [];
  const unsupported: PreviewIssue[] = [];
  const balanceOf = (token: Address): Range =>
    balances.get(token) ??
    (externalCallSeen ? { min: 0n, max: MAX_UINT256 } : { min: 0n, max: 0n });
  const move = (token: Address, amount: bigint) => {
    const before = balanceOf(token);
    balances.upsert(token, {
      min: clamp(before.min + amount),
      max:
        before.max === MAX_UINT256 ? MAX_UINT256 : clamp(before.max + amount),
    });
  };
  const unknown = (index: number, message: string): PreviewIssue => ({
    reason: "executionRequirementsUnavailable",
    detail: {
      callIndex: index,
      target: calls[index].target,
      selector: calls[index].callData.slice(0, 10) as Hex,
      message,
    },
  });

  for (const [index, call] of calls.entries()) {
    if (!isAddressEqual(call.target, ca.creditFacade)) {
      const contract = sdk.getContract(call.target);
      if (!contract?.contractType.startsWith("ADAPTER::")) {
        unsupported.push(
          unknown(index, "Call target is not a registered adapter"),
        );
        continue;
      }
      const result = classifyAdapterSafePrices(
        contract as unknown as IAdapterContract,
        call.callData,
        { balanceOf },
      );
      if (result.kind === "known" && result.useSafePrices) {
        report.useSafePrices = report.revertOnForbiddenTokens = true;
      } else if (result.kind === "state-dependent") {
        unresolved.push(unknown(index, result.reason));
      } else if (result.kind === "unsupported") {
        unsupported.push(unknown(index, result.reason));
      }
      // We deliberately do not reconstruct an AMM or wrapper here. The route's
      // enforced bracket (below), not an expected quote, can restore a bound.
      externalCallSeen = true;
      balances.clear();
      continue;
    }
    try {
      const op = decodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        data: call.callData,
      });
      switch (op.functionName) {
        case "withdrawCollateral": {
          report.useSafePrices = report.revertOnForbiddenTokens = true;
          const [token, amount] = op.args;
          if (amount === MAX_UINT256) {
            // Facade keeps one unit behind when sweeping a positive balance.
            balances.upsert(token, { min: 0n, max: 1n });
          } else move(token, -amount);
          break;
        }
        case "increaseDebt":
          if (entryPoint === "closeCreditAccount")
            unsupported.push(unknown(index, "Closing forbids borrowing"));
          report.revertOnForbiddenTokens = true;
          move(ca.underlying, op.args[0]);
          break;
        case "decreaseDebt":
          // Repayment is capped by debt plus fees; the requested amount is an
          // upper bound on spending, never proof that all of it was spent.
          balances.upsert(ca.underlying, {
            min: clamp(balanceOf(ca.underlying).min - op.args[0]),
            max: balanceOf(ca.underlying).max,
          });
          break;
        case "addCollateral":
        case "addCollateralWithPermit":
          move(op.args[0], op.args[1]);
          break;
        case "updateQuota": {
          const [token, change] = op.args;
          const i = tokens.findIndex(t => isAddressEqual(t, token));
          if (i < 0) {
            unsupported.push(
              unknown(index, "Quota token is not a credit-manager collateral"),
            );
            break;
          }
          const mask = 1n << BigInt(i);
          if (change > 0n && forbidden.has(token.toLowerCase())) {
            report.constraints.push({
              id: "forbiddenTokens",
              status: "failed",
              issue: {
                reason: "forbiddenToken",
                detail: {
                  token: toToken(sdk, token),
                  violation: "quotaIncrease",
                },
              },
            });
          }
          const before = quotas.get(token) ?? 0n;
          let delta = (change / PERCENTAGE_FACTOR) * PERCENTAGE_FACTOR;
          const quota = suite.market.pool.pqk.quotas.get(token);
          const total = quotaTotals.get(token) ?? quota?.totalQuoted ?? 0n;
          if (delta > 0n && quota) {
            const headroom = clamp(quota.limit - total);
            if (delta > headroom) delta = headroom;
          }
          const after = change === MIN_INT96 ? 0n : clamp(before + delta);
          if (
            (change !== MIN_INT96 && before + delta < 0n) ||
            after < op.args[2]
          )
            unsupported.push(
              unknown(index, "Quota update cannot satisfy its encoded bounds"),
            );
          quotas.upsert(token, after);
          quotaTotals.upsert(token, clamp(total + after - before));
          if (before === 0n && after > 0n) report.enabledTokensMask |= mask;
          if (before > 0n && after === 0n) report.enabledTokensMask &= ~mask;
          break;
        }
        case "setFullCheckParams":
          if (
            entryPoint === "closeCreditAccount" ||
            op.args[1] < MIN_HEALTH_FACTOR_FACADE ||
            op.args[0].some(mask => mask <= 1n || (mask & (mask - 1n)) !== 0n)
          ) {
            unsupported.push(unknown(index, "Invalid full-check parameters"));
          }
          report.collateralHints = [...op.args[0]];
          report.minHealthFactor = Math.max(
            MIN_HEALTH_FACTOR_FACADE,
            op.args[1],
          );
          break;
        case "storeExpectedBalances":
          if (pendingBounds?.length)
            unsupported.push(
              unknown(index, "Expected balances already stored"),
            );
          pendingBounds = op.args[0].map(delta => ({
            token: delta.token,
            min: clamp(balanceOf(delta.token).min + delta.amount),
          }));
          break;
        case "compareBalances":
          if (!pendingBounds?.length)
            unsupported.push(unknown(index, "No stored expected balances"));
          for (const bound of pendingBounds ?? [])
            balances.upsert(bound.token, { min: bound.min, max: MAX_UINT256 });
          pendingBounds = undefined;
          break;
        case "onDemandPriceUpdates":
          if (index !== 0)
            unsupported.push(unknown(index, "Price updates must be first"));
          break;
        case "setBotPermissions":
          break;
        default:
          unsupported.push(unknown(index, "Unsupported facade selector"));
      }
    } catch (e) {
      unsupported.push(
        unknown(
          index,
          `Cannot classify facade call: ${e instanceof Error ? e.message : String(e)}`,
        ),
      );
    }
  }

  // A definite true dominates conditional adapter booleans. It does not excuse
  // an unsupported selector: its other behavior is unknown as well.
  if (
    entryPoint !== "closeCreditAccount" &&
    !report.useSafePrices &&
    unresolved.length
  ) {
    report.useSafePrices = undefined;
    if (!report.revertOnForbiddenTokens)
      report.revertOnForbiddenTokens = undefined;
  }
  for (const bound of pendingBounds ?? [])
    balances.upsert(bound.token, { min: bound.min, max: MAX_UINT256 });
  const pricingIssues = [
    ...unsupported,
    ...(report.useSafePrices === undefined ? unresolved : []),
  ];
  for (const issue of pricingIssues)
    report.constraints.push({ id: "callPricing", status: "unresolved", issue });
  if (!pricingIssues.length)
    report.constraints.push({ id: "callPricing", status: "passed" });
  return report;
}

/** Preserve independently evaluated failures while retaining the primary error. */
export function captureConstraint(
  constraints: ExecutionConstraint[],
  id: ExecutionConstraint["id"],
  check: () => void,
): void {
  try {
    check();
    constraints.push({ id, status: "passed" });
  } catch (e) {
    if (!(e instanceof IntentPreviewError)) throw e;
    constraints.push({
      id,
      status: "failed",
      issue: { reason: e.reason, detail: e.detail } as PreviewIssue,
    });
  }
}

/**
 * Check the floor snapshot. Enabled forbidden tokens reject even at zero/dust.
 * Default HF is the facade's 1.0: using the form's MIN_HF_LIMITED or sizing's
 * MIN_HF_LIMITED + 2 would reject valid top-ups ending in [1.0, 1.01).
 * Improving an account still below the final threshold is insufficient.
 */
export function evaluateExecutionConstraints(
  props: MulticallConstraintsProps & {
    snapshot: AccountSnapshot;
    constraints?: ExecutionConstraint[];
  },
): ExecutionConstraintReport {
  const { sdk, creditAccount: ca, snapshot } = props;
  const suite = sdk.marketRegister.findCreditManager(ca.creditManager);
  const { enabledTokensMask, collateralHints, balanceOf, ...report } =
    inspectMulticall(props);
  report.constraints.unshift(...(props.constraints ?? []));
  if (!report.checkCollateral) {
    report.constraints.push({ id: "collateral", status: "notApplicable" });
    return report;
  }
  const initial = new AddressMap<bigint>(
    ca.tokens.map(t => [t.token, t.balance]),
  );
  const tokens = suite.creditManager.collateralTokens;
  const enabled = tokens.filter(
    (_, i) => (enabledTokensMask & (1n << BigInt(i))) !== 0n,
  );
  for (const token of enabled.filter(t =>
    suite.forbiddenTokens.some(f => isAddressEqual(f, t)),
  )) {
    const bound = balanceOf(token);
    const before = initial.get(token) ?? 0n;
    if (report.revertOnForbiddenTokens || bound.min > before) {
      report.constraints.push({
        id: "forbiddenTokens",
        status: "failed",
        issue: {
          reason: "forbiddenToken",
          detail: {
            token: toToken(sdk, token),
            violation: report.revertOnForbiddenTokens
              ? "enabled"
              : "balanceIncrease",
          },
        },
      });
    } else if (
      bound.max > before ||
      report.revertOnForbiddenTokens === undefined
    ) {
      report.constraints.push({
        id: "forbiddenTokens",
        status: "unresolved",
        issue: {
          reason: "executionRequirementsUnavailable",
          detail: {
            callIndex: props.calls.length,
            target: ca.creditFacade,
            selector: "0x",
            message:
              "Route floor cannot prove the retained forbidden balance does not grow",
          },
        },
      });
    }
    // Even a non-growing retained forbidden token forces safe prices. Unknown
    // adapter behavior may still imply rejection, so preserve its diagnostic.
    report.useSafePrices = true;
  }
  if (!report.constraints.some(c => c.id === "forbiddenTokens"))
    report.constraints.push({ id: "forbiddenTokens", status: "passed" });
  if (report.useSafePrices === undefined) {
    report.constraints.push({ id: "collateral", status: "unresolved" });
    return report;
  }
  const safePrices = report.useSafePrices;
  captureConstraint(report.constraints, "collateral", () => {
    report.checkedHealthFactor = strictCollateralFactor(
      sdk,
      snapshot,
      enabled,
      { ...report, collateralHints },
    );
    const issue = checkCollateralised({
      healthFactor: report.checkedHealthFactor,
      required: report.minHealthFactor,
      safePrices,
    });
    if (issue) throw new IntentPreviewError(issue.reason, issue.detail);
  });
  const collateral = report.constraints.find(c => c.id === "collateral");
  if (collateral)
    Object.assign(collateral, {
      actual: report.checkedHealthFactor,
      required: report.minHealthFactor,
      unit: "bps",
    });
  return report;
}

/** A structured refusal carries the full check report, not just the first miss. */
export function assertExecutionConstraints(
  report: ExecutionConstraintReport,
): void {
  const issue = report.constraints.find(c => c.issue)?.issue;
  if (issue)
    throw new IntentPreviewError(issue.reason, issue.detail, undefined, report);
}

function strictCollateralFactor(
  sdk: OnchainSDK,
  snapshot: AccountSnapshot,
  enabled: Address[],
  report: ExecutionConstraintReport & { collateralHints: bigint[] },
): Bps {
  const suite = sdk.marketRegister.findCreditManager(snapshot.creditManager);
  const oracle = suite.market.priceOracle;
  const underlying = suite.market.pool.underlying;
  const allTokens = suite.creditManager.collateralTokens;
  const balances = new AddressMap<bigint>(
    snapshot.assets.map(a => [a.token, a.balance]),
  );
  const quotas = new AddressMap<bigint>(
    snapshot.quotas.map(a => [a.token, a.balance]),
  );
  const hinted = report.collateralHints.flatMap(mask => {
    const i = allTokens.findIndex((_, j) => mask === 1n << BigInt(j));
    return i < 0 ? [] : [allTokens[i]];
  });
  const order = [
    ...new Set([...hinted, ...enabled].map(t => t.toLowerCase() as Address)),
  ].filter(
    t =>
      !isAddressEqual(t, underlying) && enabled.some(e => isAddressEqual(e, t)),
  );
  order.push(underlying);
  // Every enabled non-underlying token is quota-backed. Keep zero quota entries
  // so a token with no bought quota cannot accidentally count as unquoted.
  const checked: AccountSnapshot = {
    ...snapshot,
    assets: order.map(token => ({ token, balance: balances.get(token) ?? 0n })),
    quotas: order
      .filter(t => !isAddressEqual(t, underlying))
      .map(token => ({ token, balance: quotas.get(token) ?? 0n })),
  };
  const read = (token: Address, feed: "main" | "reserve") => {
    try {
      return feed === "main"
        ? oracle.mainPrice(token)
        : oracle.reservePrice(token);
    } catch {
      throw new IntentPreviewError("invalidPriceFeed", { token, feed });
    }
  };
  return calcHealthFactor({
    snapshot: checked,
    underlying,
    prices: {},
    decimals: Object.fromEntries(
      order.map(t => [t, sdk.tokensMeta.get(t)?.decimals ?? 18]),
    ),
    liquidationThresholds: Object.fromEntries(
      order.map(t => [
        t,
        suite.creditManager.liquidationThresholds.get(t) ?? 0,
      ]),
    ),
    // A disabled new-quota limit does not erase quota already bought.
    activeQuotas: Object.fromEntries(order.map(t => [t, true])),
    stopAt: report.minHealthFactor,
    readPrice: (token, collateral) => {
      if (
        !report.useSafePrices ||
        !collateral ||
        isAddressEqual(token, underlying)
      )
        return read(token, "main");
      const main = oracle.mainPriceFeeds.get(token);
      if (!main)
        throw new IntentPreviewError("invalidPriceFeed", {
          token,
          feed: "main",
        });
      const reserve = oracle.reservePriceFeeds.get(token);
      // _getSafePrice returns zero without reading the main answer if there is
      // no reserve configured. A failed configured reserve is never a fallback.
      if (!reserve) return 0n;
      const price = read(token, "main");
      if (isAddressEqual(main.address, reserve.address)) return price;
      const reservePrice = read(token, "reserve");
      return price < reservePrice ? price : reservePrice;
    },
  });
}

function clamp(value: bigint): bigint {
  return value < 0n ? 0n : value > MAX_UINT256 ? MAX_UINT256 : value;
}

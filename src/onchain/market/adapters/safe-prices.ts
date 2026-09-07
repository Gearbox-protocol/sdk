import {
  type Abi,
  type Address,
  decodeFunctionData,
  type Hex,
  isAddress,
  toFunctionSelector,
  zeroAddress,
} from "viem";
import type { AdapterContractType, IAdapterContract } from "./types.js";

export type AdapterSafePriceClassification =
  | { kind: "known"; useSafePrices: boolean }
  | { kind: "state-dependent"; reason: string }
  | { kind: "unsupported"; reason: string };

export interface AdapterSafePriceContext {
  /** Bounds immediately BEFORE this call, guaranteed by execution constraints.
   * Expected quote outputs are not bounds; absent state must return undefined.
   */
  balanceOf(token: Address): { min: bigint; max: bigint } | undefined;
}

type Rules = {
  versions: readonly number[];
  yes?: string;
  no?: string;
  diff?: string;
};

const curveRules: readonly Rules[] = [
  {
    versions: [311],
    yes: "exchange exchange_underlying add_liquidity add_liquidity_one_coin remove_liquidity remove_liquidity_imbalance remove_liquidity_one_coin",
    diff: "exchange_diff exchange_diff_underlying add_diff_liquidity_one_coin remove_diff_liquidity_one_coin",
  },
];

/** Reviewed Solidity return values, not protocol operations or ABI output names.
 * Every SDK adapter type is listed; versions absent here fail closed. The source
 * inventory in docs/adapter-safe-prices.md records inheritance and exceptions.
 * `diff` means false on the balance no-op branch and true on execution; a method
 * containing "Diff" does NOT imply this rule (Balancer and wrappers differ).
 */
const rules: Record<AdapterContractType, readonly Rules[]> = {
  "ADAPTER::ACCOUNT_MIGRATOR": [{ versions: [310], no: "migrate" }],
  "ADAPTER::BALANCER_V3_ROUTER": [
    {
      versions: [311],
      yes: "swapSingleTokenExactIn swapSingleTokenDiffIn addLiquidityUnbalanced addLiquidityUnbalancedDiff removeLiquiditySingleTokenExactIn removeLiquiditySingleTokenDiff",
    },
  ],
  "ADAPTER::BALANCER_V3_WRAPPER": [
    { versions: [310], no: "mint mintDiff burn burnDiff" },
  ],
  "ADAPTER::CAMELOT_V3_ROUTER": [
    {
      versions: [310],
      yes: "exactInputSingle exactInputSingleSupportingFeeOnTransferTokens exactInput exactOutputSingle exactOutput",
      diff: "exactDiffInputSingle exactDiffInputSingleSupportingFeeOnTransferTokens exactDiffInput",
    },
  ],
  "ADAPTER::CURVE_STABLE_NG": curveRules,
  "ADAPTER::CURVE_V1_2ASSETS": curveRules,
  "ADAPTER::CURVE_V1_3ASSETS": curveRules,
  "ADAPTER::CURVE_V1_4ASSETS": curveRules,
  "ADAPTER::CURVE_V1_STECRV_POOL": curveRules,
  "ADAPTER::CVX_V1_BASE_REWARD_POOL": [
    {
      versions: [311],
      no: "stake stakeDiff depositPhantomToken getReward withdraw withdrawDiff withdrawPhantomToken withdrawAndUnwrap withdrawDiffAndUnwrap",
    },
  ],
  "ADAPTER::CVX_V1_BOOSTER": [
    { versions: [310], no: "deposit depositDiff withdraw withdrawDiff" },
  ],
  "ADAPTER::DAI_USDS_EXCHANGE": [
    { versions: [310], no: "daiToUsds daiToUsdsDiff usdsToDai usdsToDaiDiff" },
  ],
  "ADAPTER::ERC4626_VAULT": [
    {
      versions: [310, 311, 312],
      no: "deposit depositDiff mint withdraw redeem redeemDiff",
    },
  ],
  "ADAPTER::ERC4626_VAULT_REFERRAL": [
    {
      versions: [310],
      no: "deposit depositDiff mint withdraw redeem redeemDiff",
    },
  ],
  "ADAPTER::FLUID_DEX": [
    { versions: [310], yes: "swapIn", diff: "swapInDiff" },
  ],
  "ADAPTER::INFINIFI_GATEWAY": [
    {
      versions: [310],
      no: "mint mintDiff stake stakeDiff unstake unstakeDiff createPosition createPositionDiff redeem redeemDiff claimRedemption",
    },
  ],
  "ADAPTER::INFINIFI_UNWINDING": [
    {
      versions: [310],
      yes: "startUnwinding",
      no: "withdraw withdrawPhantomToken",
    },
  ],
  "ADAPTER::KELP_DEPOSIT_POOL": [
    { versions: [310], yes: "depositAsset", diff: "depositAssetDiff" },
  ],
  "ADAPTER::KELP_WITHDRAWAL": [
    {
      versions: [310],
      yes: "initiateWithdrawal",
      diff: "initiateWithdrawalDiff",
      no: "completeWithdrawal withdrawPhantomToken",
    },
  ],
  "ADAPTER::LIDO_V1": [{ versions: [310], no: "submit submitDiff" }],
  "ADAPTER::LIDO_WSTETH_V1": [
    { versions: [310], no: "wrap wrapDiff unwrap unwrapDiff" },
  ],
  "ADAPTER::MELLOW_CLAIMER": [
    {
      versions: [310],
      no: "multiAccept multiAcceptAndClaim withdrawPhantomToken",
    },
  ],
  "ADAPTER::MELLOW_DVV": [
    { versions: [310], no: "withdraw redeem redeemDiff" },
  ],
  "ADAPTER::MELLOW_ERC4626_VAULT": [
    {
      versions: [312],
      no: "deposit depositDiff mint",
      yes: "withdraw redeem",
      diff: "redeemDiff",
    },
  ],
  "ADAPTER::MELLOW_WRAPPER": [{ versions: [310], no: "deposit depositDiff" }],
  "ADAPTER::MIDAS_GATEWAY": [
    {
      versions: [311],
      yes: "redeemRequest transferRedeemer",
      diff: "redeemRequestDiff",
      no: "receiveGreenlist withdraw withdrawFromRedeemer withdrawPhantomToken",
    },
  ],
  "ADAPTER::MIDAS_ISSUANCE_VAULT": [
    { versions: [310, 311], no: "depositInstant depositInstantDiff" },
  ],
  "ADAPTER::MIDAS_REDEMPTION_VAULT": [
    {
      versions: [310],
      yes: "redeemRequest",
      no: "redeemInstant redeemInstantDiff withdraw withdrawPhantomToken",
    },
    { versions: [311], no: "redeemInstant redeemInstantDiff" },
  ],
  "ADAPTER::PENDLE_ROUTER": [
    {
      versions: [311],
      yes: "swapExactTokenForPt swapExactPtForToken redeemPyToToken addLiquiditySingleToken removeLiquiditySingleToken",
      diff: "swapDiffTokenForPt swapDiffPtForToken redeemDiffPyToToken addLiquiditySingleTokenDiff removeLiquiditySingleTokenDiff",
    },
  ],
  "ADAPTER::SECURITIZE_ONRAMP": [
    { versions: [310], yes: "swap", diff: "swapDiff" },
  ],
  "ADAPTER::SECURITIZE_REDEMPTION": [
    {
      versions: [310],
      yes: "redeem",
      diff: "redeemDiff",
      no: "claim transferRedeemer",
    },
    {
      versions: [311],
      yes: "redeem claim transferRedeemer",
      diff: "redeemDiff",
    },
  ],
  "ADAPTER::STAKING_REWARDS": [
    {
      versions: [312],
      no: "stake stakeDiff depositPhantomToken getReward withdraw withdrawDiff withdrawPhantomToken",
    },
  ],
  "ADAPTER::TRADERJOE_ROUTER": [
    {
      versions: [310],
      yes: "swapExactTokensForTokens swapExactTokensForTokensSupportingFeeOnTransferTokens",
      diff: "swapDiffTokensForTokens swapDiffTokensForTokensSupportingFeeOnTransferTokens",
    },
  ],
  "ADAPTER::UNISWAP_V2_ROUTER": [
    {
      versions: [310],
      yes: "swapTokensForExactTokens swapExactTokensForTokens",
      diff: "swapDiffTokensForTokens",
    },
  ],
  "ADAPTER::UNISWAP_V3_ROUTER": [
    {
      versions: [310],
      yes: "exactInputSingle exactInput exactOutputSingle exactOutput",
      diff: "exactDiffInputSingle exactDiffInput",
    },
  ],
  "ADAPTER::UNISWAP_V4_GATEWAY": [
    {
      versions: [310],
      yes: "swapExactInputSingle",
      diff: "swapExactInputSingleDiff",
    },
  ],
  "ADAPTER::UPSHIFT_VAULT": [
    {
      versions: [311],
      no: "deposit depositDiff mint claim withdrawPhantomToken",
      yes: "requestRedeem",
      diff: "requestRedeemDiff",
    },
  ],
  "ADAPTER::VELODROME_V2_ROUTER": [
    {
      versions: [310],
      yes: "swapExactTokensForTokens",
      diff: "swapDiffTokensForTokens",
    },
  ],
};

function includes(methods: string | undefined, name: string): boolean {
  return methods?.split(" ").includes(name) ?? false;
}

/** Read optional concrete-adapter metadata without inventing a missing token.
 * SDK getters can throw MissingSerializedParamsError on unattached adapters.
 */
function property(value: unknown, key: string): unknown {
  try {
    return typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)[key]
      : undefined;
  } catch {
    return undefined;
  }
}

/** Classifies the adapter's return flag CONDITIONAL ON SUCCESS. This does not
 * prove pool permissions, token balances, claim maturity, or transaction success.
 * False cannot clear an already-set facade flag. Unsupported selectors, getters,
 * administrative calls, unknown versions, and reverting-only methods are never
 * treated as harmless false-returning operations.
 */
export function classifyAdapterSafePrices(
  adapter: IAdapterContract,
  calldata: Hex,
  context?: AdapterSafePriceContext,
): AdapterSafePriceClassification {
  const unsupported = (reason: string): AdapterSafePriceClassification => ({
    kind: "unsupported",
    reason,
  });
  const selected = rules[adapter.contractType as AdapterContractType]?.find(
    rule => rule.versions.includes(adapter.version),
  );
  if (!selected)
    return unsupported(
      `Unreviewed adapter type/version: ${adapter.contractType} v${adapter.version}`,
    );

  let name: string;
  let args: readonly unknown[];
  try {
    const abi = property(adapter, "abi") as Abi | undefined;
    if (!abi) return unsupported("Adapter ABI is unavailable");
    const decoded = decodeFunctionData({ abi, data: calldata });
    name = decoded.functionName;
    args = decoded.args ?? [];
    // Select the actual overload by selector, never by a name-only ABI lookup.
    const method = abi.find(
      item =>
        item.type === "function" &&
        toFunctionSelector(item) === calldata.slice(0, 10),
    );
    if (
      method?.type !== "function" ||
      method.stateMutability === "view" ||
      method.stateMutability === "pure"
    ) {
      return unsupported("Selector is not an adapter operation");
    }
  } catch {
    return unsupported(
      `Cannot decode adapter selector ${calldata.slice(0, 10)}`,
    );
  }
  // The SDK uses the v311 Securitize ABI for both deployments. The extraData
  // overloads were introduced in v311; decoding them does not make them v310
  // operations. The original one-argument selectors remain valid in v311.
  if (
    adapter.contractType === "ADAPTER::SECURITIZE_REDEMPTION" &&
    adapter.version === 310 &&
    (name === "redeem" || name === "redeemDiff") &&
    args.length !== 1
  )
    return unsupported("Securitize extraData overload requires v311");
  if (includes(selected.yes, name))
    return { kind: "known", useSafePrices: true };
  if (includes(selected.no, name))
    return { kind: "known", useSafePrices: false };
  if (!includes(selected.diff, name))
    return unsupported(`Unreviewed adapter operation: ${name}`);

  // Resolve only the balance actually read by this Solidity method. These are
  // explicit method/type branches, not a heuristic based on an ABI bool name.
  let token: unknown;
  let leftover: unknown;
  const type = adapter.contractType;
  if (
    type === "ADAPTER::UNISWAP_V3_ROUTER" ||
    type === "ADAPTER::CAMELOT_V3_ROUTER"
  ) {
    leftover = property(args[0], "leftoverAmount");
    token = property(args[0], "tokenIn");
    const path = property(args[0], "path");
    if (!token && typeof path === "string" && /^0x[0-9a-fA-F]{40}/.test(path))
      token = path.slice(0, 42);
  } else if (type === "ADAPTER::UNISWAP_V2_ROUTER") {
    token = property(args[2], "0");
    leftover = args[0];
  } else if (type === "ADAPTER::TRADERJOE_ROUTER") {
    token = property(property(args[2], "tokenPath"), "0");
    leftover = args[0];
  } else if (type === "ADAPTER::VELODROME_V2_ROUTER") {
    token = property(property(args[2], "0"), "from");
    leftover = args[0];
  } else if (type === "ADAPTER::UNISWAP_V4_GATEWAY") {
    token = property(args[0], args[1] ? "token0" : "token1");
    leftover = args[2];
    // Native-token pools read WETH. The SDK does not expose this immutable;
    // a missing WETH address remains unresolved instead of using address(0).
    if (token === zeroAddress) token = property(adapter, "weth");
  } else if (type.startsWith("ADAPTER::CURVE_")) {
    if (name === "exchange_diff" || name === "exchange_diff_underlying") {
      token = property(
        property(adapter, name === "exchange_diff" ? "tokens" : "underlyings"),
        String(args[0]),
      );
      leftover = args[2];
    } else if (name === "add_diff_liquidity_one_coin") {
      token = property(property(adapter, "tokens"), String(args[1]));
      leftover = args[0];
    } else {
      token = property(adapter, "lpToken");
      leftover = args[0];
    }
  } else if (type === "ADAPTER::FLUID_DEX") {
    token = property(adapter, args[0] ? "token0" : "token1");
    leftover = args[1];
  } else if (type === "ADAPTER::KELP_DEPOSIT_POOL") {
    token = args[0];
    leftover = args[1];
  } else if (type === "ADAPTER::KELP_WITHDRAWAL") {
    token = property(adapter, "rsETH");
    leftover = args[1];
  } else if (type === "ADAPTER::MIDAS_GATEWAY") {
    token = property(adapter, "mToken");
    leftover = args[0];
  } else if (type === "ADAPTER::SECURITIZE_REDEMPTION") {
    token = property(adapter, "dsToken");
    leftover = args[0];
  } else if (type === "ADAPTER::SECURITIZE_ONRAMP") {
    token = property(adapter, "liquidityToken");
    leftover = args[0];
  } else if (
    type === "ADAPTER::MELLOW_ERC4626_VAULT" ||
    type === "ADAPTER::UPSHIFT_VAULT"
  ) {
    token = property(adapter, "vault");
    leftover = args[0];
  } else if (type === "ADAPTER::PENDLE_ROUTER") {
    if (
      name === "swapDiffTokenForPt" ||
      name === "addLiquiditySingleTokenDiff"
    ) {
      token = property(args[3], "tokenIn");
      leftover = property(args[3], "leftoverTokenIn");
    } else if (name === "removeLiquiditySingleTokenDiff") {
      token = args[0];
      leftover = args[1];
    }
    // PT is read from market.readTokens()/YT.PT(), not encoded in calldata.
    // Those two redemption/swap branches remain state-dependent without it.
  }
  if (
    typeof token === "string" &&
    isAddress(token) &&
    typeof leftover === "bigint"
  ) {
    const balance = context?.balanceOf(token);
    if (balance && balance.min >= 0n && balance.max >= balance.min) {
      // Kelp's source uses <, unlike the <= guard in every other diff rule.
      const strict =
        type === "ADAPTER::KELP_DEPOSIT_POOL" ||
        type === "ADAPTER::KELP_WITHDRAWAL";
      if (strict ? balance.min >= leftover : balance.min > leftover)
        return { kind: "known", useSafePrices: true };
      if (strict ? balance.max < leftover : balance.max <= leftover)
        return { kind: "known", useSafePrices: false };
    }
  }
  return {
    kind: "state-dependent",
    reason: `${name} may execute (true) or take its balance no-op branch (false); pre-call balance bounds or token metadata are missing or inconclusive`,
  };
}

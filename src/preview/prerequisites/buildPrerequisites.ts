import { type Address, isAddressEqual } from "viem";

import {
  AddressSet,
  type GetApprovalAddressProps,
  NATIVE_ADDRESS,
  type OnchainSDK,
  type PluginsMap,
} from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";
import {
  type ParseOperationCalldataInput,
  parseOperationCalldata,
} from "../parse/parseOperationCalldata.js";

import { AllowancePrerequisite } from "./AllowancePrerequisite.js";
import { BalancePrerequisite } from "./BalancePrerequisite.js";
import type { AnyPrerequisite } from "./Prerequisite.js";
import { RWAOpenRequirementsPrerequisite } from "./RWAOpenRequirementsPrerequisite.js";
import type { PrerequisiteContext } from "./types.js";

/**
 * Input of {@link buildPrerequisites}: the same raw-calldata input as the
 * internal calldata parser, plus an optional block to read at.
 */
export type BuildPrerequisitesInput<P extends PluginsMap = PluginsMap> =
  ParseOperationCalldataInput<P> & {
    /** Block to read at; defaults to latest. Only set for testnet forks. */
    blockNumber?: bigint;
  };

/**
 * Derives the on-chain prerequisites for an operation given its raw calldata:
 * the conditions that must hold for the call not to revert and that we can
 * verify with the SDK (token approvals, wallet balances). The calldata is
 * decoded internally via `parseOperationCalldata`.
 *
 * Only *sender-actionable* prerequisites belong here: conditions the LP
 * provider or borrower can fix themselves before retrying (e.g. approve a
 * token, top up a balance). Non-actionable protocol/admin state (pool pause,
 * available pool liquidity, health factor, liquidatability, degen NFT gating,
 * bot permissions) is intentionally out of scope, since the user cannot
 * resolve it. New {@link AnyPrerequisite} subclasses must follow the same rule.
 */
export async function buildPrerequisites<P extends PluginsMap>(
  input: BuildPrerequisitesInput<P>,
): Promise<AnyPrerequisite[]> {
  const { sdk, sender: wallet, blockNumber } = input;
  const tx = parseOperationCalldata(input);
  const ctx: PrerequisiteContext = { sdk, wallet, blockNumber };

  switch (tx.operation) {
    // Deposit and Mint both pull the underlying from the caller into the pool;
    // they only differ in which side (assets vs shares) the caller specifies.
    // The exact underlying amount for Mint is resolved by the pool, so we can
    // only require an allowance/balance against the known specified amount —
    // here we approximate Mint by its shares amount (a lower bound on assets is
    // not knowable from calldata alone).
    case "Deposit":
      // Zapper-routed deposits pull the zapper's `tokenIn` (which may differ
      // from the pool underlying) and the allowance must go to the zapper.
      // Native-token zappers (e.g. WETH_DEPOSIT) take the deposit as
      // `msg.value`, so no allowance is needed there.
      if (tx.zapper) {
        const prereqs: AnyPrerequisite[] = [];
        if (!isAddressEqual(tx.tokenIn, NATIVE_ADDRESS)) {
          prereqs.push(
            new AllowancePrerequisite({
              token: tx.tokenIn,
              owner: wallet,
              spender: tx.zapper,
              required: tx.assets,
              title: "Token approved to zapper",
            }),
          );
        }
        prereqs.push(
          new BalancePrerequisite({
            token: tx.tokenIn,
            owner: wallet,
            required: tx.assets,
            title: "Sufficient token balance",
          }),
        );
        return prereqs;
      }
      return [
        new AllowancePrerequisite({
          token: tx.underlying,
          owner: wallet,
          spender: tx.pool,
          required: tx.assets,
          title: "Token approved to pool",
        }),
        new BalancePrerequisite({
          token: tx.underlying,
          owner: wallet,
          required: tx.assets,
          title: "Sufficient token balance",
        }),
      ];

    case "Mint":
      return [
        new AllowancePrerequisite({
          token: tx.underlying,
          owner: wallet,
          spender: tx.pool,
          required: tx.shares,
          title: "Token approved to pool",
        }),
        new BalancePrerequisite({
          token: tx.underlying,
          owner: wallet,
          required: tx.shares,
          title: "Sufficient token balance",
        }),
      ];

    // Redeem and Withdraw both burn LP shares from `owner`; they only differ in
    // which side (shares vs assets) the caller specifies.
    case "Redeem": {
      // Zapper-routed redeems pull the operation's `tokenIn` (the zapper's
      // share-side token, which is the pool diesel token only for plain
      // zappers — farmed/staked wrappers differ) from the caller, so that
      // token must be approved to the zapper (no third-party `owner`).
      if (tx.zapper) {
        return [
          new BalancePrerequisite({
            token: tx.tokenIn,
            owner: wallet,
            required: tx.shares,
            title: "Sufficient share token balance",
          }),
          new AllowancePrerequisite({
            token: tx.tokenIn,
            owner: wallet,
            spender: tx.zapper,
            required: tx.shares,
            title: "Share token approved to zapper",
          }),
        ];
      }
      const prereqs: AnyPrerequisite[] = [
        new BalancePrerequisite({
          token: tx.pool,
          owner: tx.owner,
          required: tx.shares,
          title: "Sufficient LP token balance",
        }),
      ];
      // A third party redeeming on behalf of `owner` needs an LP allowance.
      if (!isAddressEqual(tx.owner, wallet)) {
        prereqs.push(
          new AllowancePrerequisite({
            token: tx.pool,
            owner: tx.owner,
            spender: wallet,
            required: tx.shares,
            title: "LP token approved to caller",
          }),
        );
      }
      return prereqs;
    }

    case "Withdraw": {
      const prereqs: AnyPrerequisite[] = [
        new BalancePrerequisite({
          token: tx.pool,
          owner: tx.owner,
          required: tx.assets,
          title: "Sufficient LP token balance",
        }),
      ];
      // A third party withdrawing on behalf of `owner` needs an LP allowance.
      if (!isAddressEqual(tx.owner, wallet)) {
        prereqs.push(
          new AllowancePrerequisite({
            token: tx.pool,
            owner: tx.owner,
            spender: wallet,
            required: tx.assets,
            title: "LP token approved to caller",
          }),
        );
      }
      return prereqs;
    }

    case "MultiCall":
    case "BotMulticall":
    case "OpenCreditAccount":
    case "CloseCreditAccount":
    case "LiquidateCreditAccount":
      return collateralPrerequisites(
        tx.operation === "OpenCreditAccount"
          ? { creditManager: tx.creditManager, borrower: wallet }
          : {
              creditManager: tx.creditManager,
              creditAccount: tx.creditAccount,
            },
        tx.multicall,
        ctx,
      );

    // RWA-factory operations: same collateral checks as facade operations,
    // plus (for opening) the factory's open-account requirements. The parsed
    // operation carries template (empty) `tokensToRegister`/`signaturesToCache`;
    // the prerequisite detail provides the real values.
    case "SecuritizeOpenCreditAccount":
      return [
        ...(await collateralPrerequisites(
          { creditManager: tx.creditManager, borrower: wallet },
          tx.multicall,
          ctx,
        )),
        ...(await rwaOpenRequirementsPrerequisites(
          tx.multicall,
          tx.creditManager,
          ctx,
        )),
      ];

    case "SecuritizeMulticall":
      return collateralPrerequisites(
        { creditManager: tx.creditManager, creditAccount: tx.creditAccount },
        tx.multicall,
        ctx,
      );

    case "PartiallyLiquidateCreditAccount": {
      const underlying = underlyingOf(ctx.sdk, tx.creditManager);
      if (!underlying || tx.repaidAmount === 0n) {
        return [];
      }
      return [
        new AllowancePrerequisite({
          token: underlying,
          owner: wallet,
          spender: tx.creditManager,
          required: tx.repaidAmount,
          title: "Underlying approved to credit manager",
        }),
        new BalancePrerequisite({
          token: underlying,
          owner: wallet,
          required: tx.repaidAmount,
          title: "Sufficient underlying balance",
        }),
      ];
    }

    default:
      return [];
  }
}

/**
 * For every `addCollateral` inside a multicall, requires the wallet to approve
 * and hold the collateral token for the collateral spender.
 *
 * The approval spender is resolved via {@link OnchainSDK.accounts.getApprovalAddress}:
 * the credit manager for classic markets, but a per-investor "special wallet"
 * for RWA markets.
 */
async function collateralPrerequisites(
  spenderOptions: GetApprovalAddressProps,
  multicall: InnerOperation[],
  ctx: PrerequisiteContext,
): Promise<AnyPrerequisite[]> {
  const { sdk, wallet } = ctx;
  const required = new Map<string, { token: Address; amount: bigint }>();
  for (const op of multicall) {
    if (op.operation !== "AddCollateral" || op.amount === 0n) {
      continue;
    }
    const key = op.token.toLowerCase();
    const existing = required.get(key);
    required.set(key, {
      token: op.token,
      amount: (existing?.amount ?? 0n) + op.amount,
    });
  }

  if (required.size === 0) {
    return [];
  }

  const spender = await sdk.accounts.getApprovalAddress(spenderOptions);

  const prereqs: AnyPrerequisite[] = [];
  for (const { token, amount } of required.values()) {
    prereqs.push(
      new AllowancePrerequisite({
        token,
        owner: wallet,
        spender,
        required: amount,
        title: "Collateral approved",
      }),
      new BalancePrerequisite({
        token,
        owner: wallet,
        required: amount,
        title: "Sufficient collateral balance",
      }),
    );
  }
  return prereqs;
}

/**
 * For RWA-factory open-account operations (e.g. `SecuritizeOpenCreditAccount`),
 * checks the factory's open-account requirements (issuer-side token
 * registration, EIP-712 signatures) for every RWA token the multicall touches.
 *
 * Each prerequisite's detail is the exact
 * `sdk.accounts.getOpenAccountRequirements` output, so consumers can use it to
 * fill in the operation's template `tokensToRegister`/`signaturesToCache` when
 * building the final transaction.
 *
 * The candidate tokens are the union of `addCollateral` and `updateQuota`
 * tokens: in the direct-deposit flow the RWA token is added as collateral,
 * while in the leverage flow it only appears as the quoted token. The union is
 * then filtered to tokens the factory actually gates
 * (via {@link IRWAFactory.getTokens}).
 *
 * Returns nothing for non-RWA markets.
 */
async function rwaOpenRequirementsPrerequisites(
  multicall: InnerOperation[],
  creditManager: Address,
  ctx: PrerequisiteContext,
): Promise<AnyPrerequisite[]> {
  const { sdk, wallet } = ctx;
  const { rwaFactory } = sdk.marketRegister.findByCreditManager(creditManager);
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
    const requirements = await sdk.accounts.getOpenAccountRequirements(
      wallet,
      creditManager,
      { tokenOutAddress: token },
    );
    if (requirements) {
      prereqs.push(
        new RWAOpenRequirementsPrerequisite({
          requirements,
          token,
          factory: rwaFactory.address,
        }),
      );
    }
  }
  return prereqs;
}

/** Resolves the underlying token of a credit manager via the market register. */
function underlyingOf(
  sdk: OnchainSDK,
  creditManager: Address,
): Address | undefined {
  const suite = sdk.marketRegister.creditManagers.find(cm =>
    isAddressEqual(cm.creditManager.address, creditManager),
  );
  return suite?.underlying;
}

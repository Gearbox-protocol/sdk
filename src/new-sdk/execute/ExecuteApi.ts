import type { Address } from "viem";
import type { ChainId } from "../../model/index.js";
import type { Asset, OnchainSDK, RawTx } from "../../sdk/index.js";
import type {
  ChainOf,
  LpSimulate,
  OpenStrategySimulate,
  StrategySimulate,
} from "../simulate/index.js";

/**
 * A pool deposit or withdrawal, as {@link OpportunitiesSimulate.deposit} /
 * {@link OpportunitiesSimulate.withdraw} priced it. The simulation carries the
 * tokens on both sides and the zapper, so nothing else is needed to encode
 * the call.
 **/
export interface PoolPrepareRequest {
  kind: "pool";
  chainId: ChainId;
  pool: Address;
  wallet: Address;
  op: "deposit" | "withdraw";
  sim: LpSimulate;
}

/**
 * Opening a new position, from a viable
 * {@link OpportunitiesSimulate.openNewStrategy} result. The preview values
 * collateral in underlying only, so the wallet's actual collateral assets and
 * the native value to attach come from the caller.
 **/
export interface OpenPrepareRequest {
  kind: "open";
  chainId: ChainId;
  creditManager: Address;
  wallet: Address;
  sim: Extract<OpenStrategySimulate, { ok: true }>;
  /** What leaves the wallet, token by token. */
  collateral: Asset[];
  /** Native value to attach when paying a wrapped-native market in the coin. */
  ethAmount: bigint;
}

/**
 * Any of the five operations on an existing account, from a viable
 * {@link StrategySimulate}: the facade multicall is the simulation's `calls`.
 **/
export interface AccountPrepareRequest {
  kind: "account";
  chainId: ChainId;
  creditAccount: Address;
  wallet: Address;
  sim: Extract<StrategySimulate, { ok: true }>;
}

/**
 * What {@link OpportunitiesExecute.buildTx} turns into a transaction: a
 * simulate result plus the few facts about the wallet the simulation does not
 * carry.
 **/
export type PrepareRequest =
  | PoolPrepareRequest
  | OpenPrepareRequest
  | AccountPrepareRequest;

/**
 * The write side of the opportunities namespace: turns what `simulate`
 * answered into the transaction to sign. Sending, and whatever the wallet has
 * to do first (allowances, permits, RWA signatures), stays with the caller —
 * `checkPrerequisites` reports the former on the built transaction.
 **/
export interface OpportunitiesExecute {
  /**
   * The transaction to sign, from a simulate result. No second round of math:
   * `account` requests submit the simulation's own multicall, `open` requests
   * hand the preview's router path and quotas to `openCA`, `pool` requests
   * encode the deposit / redeem the simulation priced.
   *
   * @throws on a simulation that is not `ok`; when a `pool` request names a
   * route the pool has no metadata for, or one the pool does not accept a
   * transaction for (RWA on-demand deposits)
   **/
  buildTx(request: PrepareRequest): Promise<RawTx>;
}

/**
 * {@inheritDoc OpportunitiesExecute}
 **/
export class ExecuteApi implements OpportunitiesExecute {
  readonly #chainOf: ChainOf;

  constructor(chainOf: ChainOf) {
    this.#chainOf = chainOf;
  }

  /**
   * {@inheritDoc OpportunitiesExecute.buildTx}
   **/
  public async buildTx(request: PrepareRequest): Promise<RawTx> {
    if (request.kind !== "pool" && !request.sim.ok) {
      // the types rule this out; a caller that skipped them still gets no
      // transaction out of a simulation that failed
      throw new Error(
        `cannot build a transaction from a failed ${request.kind} simulation`,
      );
    }
    const sdk = this.#chainOf(request.chainId);
    switch (request.kind) {
      case "pool":
        return poolTx(sdk, request);
      case "open":
        return openTx(sdk, request);
      case "account":
        return accountTx(sdk, request);
    }
  }
}

function poolTx(sdk: OnchainSDK, request: PoolPrepareRequest): RawTx {
  const { pool, wallet, sim } = request;
  if (request.op === "deposit") {
    const meta = sdk.pools.getDepositMetadata(
      pool,
      sim.tokenIn.token,
      sim.tokenOut.token,
    );
    const result = sdk.pools.addLiquidity({
      pool,
      wallet,
      collateral: sim.tokenIn,
      meta,
    });
    if (!result) {
      throw new Error(
        `pool ${pool} takes no deposit transaction for ${sim.tokenIn.token} (${meta.type})`,
      );
    }
    return result.tx;
  }
  const meta = sdk.pools.getWithdrawalMetadata(
    pool,
    sim.tokenIn.token,
    sim.tokenOut.token,
  );
  return sdk.pools.removeLiquidity({
    pool,
    wallet,
    amount: sim.tokenIn.balance,
    permit: undefined,
    meta,
  }).tx;
}

function openTx(sdk: OnchainSDK, request: OpenPrepareRequest): Promise<RawTx> {
  const { creditManager, wallet, collateral, ethAmount, sim } = request;
  const { preview } = sim;
  return sdk.accounts.openCA({
    creditManager,
    to: wallet,
    collateral,
    ethAmount,
    debt: preview.debt,
    calls: preview.calls,
    averageQuota: preview.averageQuota,
    minQuota: preview.minQuota,
    permits: {},
    referralCode: 0n,
  });
}

async function accountTx(
  sdk: OnchainSDK,
  request: AccountPrepareRequest,
): Promise<RawTx> {
  const account = await sdk.accounts.getCreditAccountData(
    request.creditAccount,
  );
  if (!account) {
    throw new Error(`credit account not found: ${request.creditAccount}`);
  }
  return sdk.accounts.executeCaUpdate(account, request.sim.calls);
}

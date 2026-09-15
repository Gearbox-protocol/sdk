import type { Address } from "viem";
import type { RWAOperationArgs } from "../../model/index.js";
import type {
  AccountCalculatorOperation,
  OnchainSDK,
  RawTx,
} from "../../onchain/index.js";
import type { ChainOf } from "../prepare/index.js";
import type {
  AccountPrepareRequest,
  BorrowPrepareRequest,
  IOpportunitiesExecute,
  OpenPrepareRequest,
  PoolPrepareRequest,
  PrepareRequest,
} from "./types.js";

/**
 * {@inheritDoc IOpportunitiesExecute}
 **/
export class ExecuteApi implements IOpportunitiesExecute {
  readonly #chainOf: ChainOf;

  constructor(chainOf: ChainOf) {
    this.#chainOf = chainOf;
  }

  /**
   * {@inheritDoc IOpportunitiesExecute.buildTx}
   **/
  public async buildTx(request: PrepareRequest): Promise<RawTx> {
    if (!request.sim.ok) {
      // the types rule this out; a caller that skipped them still gets no
      // transaction out of a `prepare` result that failed
      throw new Error(
        `cannot build a transaction from a failed ${request.kind} preparation`,
      );
    }
    const sdk = this.#chainOf(request.chainId);
    switch (request.kind) {
      case "pool":
        return poolTx(sdk, request);
      case "open":
        return openTx(sdk, request);
      case "borrow":
        return borrowTx(sdk, request);
      case "account":
        return accountTx(sdk, request);
    }
  }
}

function poolTx(sdk: OnchainSDK, request: PoolPrepareRequest): RawTx {
  const { pool, wallet, sim } = request;
  const { tokenIn, tokenOut } = sim.data.state;
  if (request.op === "deposit") {
    const meta = sdk.pools.getDepositMetadata(
      pool,
      tokenIn.token.address,
      tokenOut.token.address,
    );
    const result = sdk.pools.addLiquidity({
      pool,
      wallet,
      collateral: { token: tokenIn.token.address, balance: tokenIn.value },
      meta,
    });
    if (!result) {
      throw new Error(
        `pool ${pool} takes no deposit transaction for ${tokenIn.token.address} (${meta.type})`,
      );
    }
    return result.tx;
  }
  const meta = sdk.pools.getWithdrawalMetadata(
    pool,
    tokenIn.token.address,
    tokenOut.token.address,
  );
  return sdk.pools.removeLiquidity({
    pool,
    wallet,
    amount: request.op === "withdraw" ? tokenOut.value : tokenIn.value,
    permit: undefined,
    meta,
    mode: request.op === "withdraw" ? "withdraw" : "redeem",
  }).tx;
}

async function openTx(
  sdk: OnchainSDK,
  request: OpenPrepareRequest,
): Promise<RawTx> {
  const { creditManager, wallet, collateral, ethAmount, sim } = request;
  const { state } = sim.data;
  return sdk.accounts.openCA({
    creditManager,
    to: wallet,
    collateral,
    ethAmount,
    debt: state.totalDebt.value,
    calls: state.calls,
    averageQuota: state.averageQuota,
    minQuota: state.minQuota,
    reopenCreditAccount: state.creditAccount,
    permits: {},
    referralCode: 0n,
    rwaOptions: await openRwaOptions(sdk, request, request.targetToken),
  });
}

/**
 * A loan is an opening whose debt leaves again, so it is the same `openCA`
 * with `withdrawToken` set: the facade draws the debt, takes the collateral,
 * runs whatever path buys the payout, and sweeps that payout to the wallet.
 *
 * Both quota branches are the one the state carries. An opening has two
 * because the balances it lands on are a router quote; here the account is
 * left holding the collateral the caller named, and a named amount has no
 * floor to differ from.
 **/
async function borrowTx(
  sdk: OnchainSDK,
  request: BorrowPrepareRequest,
): Promise<RawTx> {
  const { creditManager, wallet, ethAmount, sim } = request;
  const { state } = sim.data;
  const collateral = {
    token: state.collateral.token.address,
    balance: state.collateral.value,
  };
  return sdk.accounts.openCA({
    creditManager,
    to: wallet,
    collateral: [collateral],
    ethAmount,
    debt: state.totalDebt.value,
    calls: state.calls,
    withdrawToken: state.borrowed.token.address,
    averageQuota: state.quotaIncrease,
    minQuota: state.quotaIncrease,
    permits: {},
    referralCode: 0n,
    rwaOptions: await openRwaOptions(sdk, request, collateral.token),
  });
}

/**
 * The documented `openCA` contract: ask the market for its open requirements
 * and hand them back as operation args, with the caller's cached signatures
 * attached. `undefined` on non-RWA markets and when no token is named.
 *
 * `token` is the one the account ends up holding, which is what an RWA market
 * gates on: the opening's target, and the borrow's collateral.
 **/
async function openRwaOptions(
  sdk: OnchainSDK,
  request: Pick<
    OpenPrepareRequest,
    "wallet" | "creditManager" | "signaturesToCache"
  >,
  token: Address | undefined,
): Promise<RWAOperationArgs | undefined> {
  if (!token) {
    return undefined;
  }
  const requirements = await sdk.accounts.getOpenAccountRequirements(
    request.wallet,
    request.creditManager,
    { tokenOutAddress: token },
  );
  if (requirements?.protocol !== "securitize") {
    return undefined;
  }
  return {
    protocol: "securitize",
    tokensToRegister: requirements.tokensToRegister,
    signaturesToCache: request.signaturesToCache ?? [],
  };
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
  return sdk.accounts.executeCaUpdate(account, request.sim.data.calls, {
    ethAmount: nativeValue(request.sim.data.operations),
  });
}

/**
 * The coin the preparation asked the wallet for, which the facade wraps out of
 * `msg.value` before running the multicall. Taken off the collateral step that
 * recorded it rather than from the caller, so it cannot disagree with what was
 * prepared.
 **/
function nativeValue(operations: AccountCalculatorOperation[]): bigint {
  return operations.reduce(
    (total, op) =>
      total + (op.type === "addCollateral" ? (op.value ?? 0n) : 0n),
    0n,
  );
}

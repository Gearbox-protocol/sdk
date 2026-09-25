import assert from "node:assert/strict";
import { type Address, erc20Abi, type Hex, isAddressEqual } from "viem";
import { MAX_UINT16 } from "../../onchain/constants/math.js";
import { ADDRESS_0X0, type RawTx } from "../../onchain/index.js";
import type {
  FinalizeParams,
  FinalizeResult,
  StrategyResult,
  StrategyRoutesResult,
} from "../../sdk/prepare/types.js";
import type { AnvilAccountEnvironment } from "../AnvilAccountEnvironment.js";
import { openSetupPosition } from "./openSetupPosition.js";
import { prepared, projection, unavailable } from "./prepared.js";
import {
  type JourneyExecution,
  type JourneyPositionSetup,
  type JourneySession,
  type JourneySessionOptions,
  type JourneyState,
  JourneyUnavailable,
} from "./types.js";

/** The contract's own sentinel for a position without debt. */
const NO_DEBT_HEALTH_FACTOR = Number(MAX_UINT16);
/** A bounded loop supports protocols that settle several claims without an endless run. */
const MAX_CLAIMS = 8;

/** Shared Anvil infrastructure: setup, state reads, transaction transport and settlement. */
export class AnvilJourneySession implements JourneySession {
  #creditAccount?: Address;

  constructor(public readonly options: JourneySessionOptions) {}

  get sdk() {
    return this.options.sdk;
  }
  get environment() {
    return this.options.environment;
  }
  get prepare() {
    return this.sdk.opportunities.prepare;
  }
  get underlying() {
    return this.options.strategy.underlyingToken.address;
  }
  get target() {
    return this.options.strategy.targetCollateral.address;
  }
  get owner() {
    return this.environment.borrower.address;
  }
  get position() {
    assert(this.#creditAccount, "Open a position before managing it");
    return {
      chainId: this.options.key.chainId,
      creditAccount: this.#creditAccount,
    };
  }

  /** Plain max* reads use the actual pool underlying; public position amounts may use an RWA's unwrapped asset. */
  fundingAmount(amount: bigint): bigint {
    const { sdk } = this.environment;
    const suite = sdk.marketRegister.findCreditManager(
      this.options.key.creditManager,
    );
    if (isAddressEqual(suite.underlying, this.underlying)) return amount;
    return sdk.marketRegister
      .findByCreditManager(suite.creditManager.address)
      .priceOracle.convert(suite.underlying, this.underlying, amount);
  }

  async fund(token: Address, amount: bigint): Promise<void> {
    try {
      await this.environment.ensureTokenBalance(this.owner, token, amount);
      await this.environment.approve(token, this.options.key.creditManager);
    } catch (error) {
      throw new JourneyUnavailable(
        "blocked",
        `Unable to fund/approve ${token} on this fork`,
        { cause: error },
      );
    }
    await this.environment.sync();
  }

  public async setupPosition(): Promise<JourneyPositionSetup> {
    assert(!this.#creditAccount, "A setup position already exists");
    const { collateral, leverage, key, slippage } = this.options;
    await this.fund(this.underlying, collateral);
    const opened = await openSetupPosition({
      sdk: this.sdk,
      environment: this.environment,
      key,
      collateral: { token: this.underlying, balance: collateral },
      target: this.target,
      leverage,
      slippage,
      creditAccount: this.options.openingAccount?.creditAccount,
    });
    this.#creditAccount = opened.creditAccount;
    await this.environment.sync();
    return { transactions: opened.transactions, state: await this.state() };
  }

  async state(): Promise<JourneyState> {
    const { creditAccount } = this.position;
    const [
      positions,
      walletUnderlying,
      walletTarget,
      targetBalance,
      withdrawals,
    ] = await Promise.all([
      this.sdk.positions.list(this.owner),
      this.#balance(this.underlying, this.owner),
      this.#balance(this.target, this.owner),
      this.#balance(this.target, creditAccount),
      this.sdk.positions.getCurrentWithdrawals({
        ...this.options.key,
        creditAccount,
      }),
    ]);
    const position = positions.data.find(
      p =>
        p.kind === "strategy" &&
        p.chainId === this.options.key.chainId &&
        isAddressEqual(p.creditAccount, creditAccount),
    );
    assert(
      position?.kind === "strategy",
      "The borrower does not own the expected position",
    );
    assert(
      isAddressEqual(position.creditManager, this.options.key.creditManager),
      "Position belongs to another strategy",
    );
    assert(
      !position.error,
      `Position valuation is incomplete: ${position.error}`,
    );
    return {
      creditAccount,
      debt: position.totalDebt.value,
      value: position.totalValue.value,
      leverage: position.leverage,
      healthFactor: position.healthFactor,
      targetBalance,
      walletUnderlying,
      walletTarget,
      quota: position.collaterals.reduce((sum, c) => sum + c.quota.value, 0n),
      pendingWithdrawals:
        withdrawals.data.pending.length + withdrawals.data.claimable.length,
    };
  }

  async stateOrEmpty(): Promise<JourneyState> {
    if (this.#creditAccount) return this.state();
    const [walletUnderlying, walletTarget] = await Promise.all([
      this.#balance(this.underlying, this.owner),
      this.#balance(this.target, this.owner),
    ]);
    return {
      creditAccount: ADDRESS_0X0,
      debt: 0n,
      value: 0n,
      leverage: 0,
      healthFactor: NO_DEBT_HEALTH_FACTOR,
      targetBalance: 0n,
      walletUnderlying,
      walletTarget,
      quota: 0n,
      pendingWithdrawals: 0,
    };
  }

  adoptCreditAccount(account: Address): void {
    assert(
      !this.#creditAccount || isAddressEqual(this.#creditAccount, account),
      "Cannot replace the journey's credit account",
    );
    this.#creditAccount = account;
  }

  async sendTx(tx: RawTx, label: string) {
    const confirmed = await this.environment.sendAndConfirm(
      tx,
      this.environment.borrower,
      label,
    );
    await this.environment.sync();
    return confirmed;
  }

  async direct(data: StrategyResult, label: string): Promise<JourneyExecution> {
    return {
      transactions: [await this.#send(data, label)],
      expected: projection(data.state),
      route: "direct",
    };
  }

  async routed(
    routes: StrategyRoutesResult,
    label: string,
    allowDelayed = true,
  ): Promise<JourneyExecution> {
    const preference = allowDelayed ? this.options.route : "instant";
    if (preference !== "delayed" && routes.instant) {
      return {
        transactions: [await this.#send(routes.instant, label)],
        expected: projection(routes.instant.state),
        route: "instant",
      };
    }
    if (preference === "instant" || !routes.delayed) {
      const error =
        preference === "delayed"
          ? routes.errors.delayed
          : routes.errors.instant;
      throw error
        ? unavailable(error, label)
        : new JourneyUnavailable(
            "unsupported",
            `${label}: no ${preference} route`,
          );
    }
    return this.#settleDelayed(routes.delayed, label);
  }

  #balance(token: Address, account: Address): Promise<bigint> {
    return this.environment.anvil.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [account],
    });
  }

  async #send(data: StrategyResult, label: string): Promise<Hex> {
    const tx = await this.sdk.opportunities.execute.buildTx({
      kind: "account",
      ...this.position,
      wallet: this.owner,
      sim: { ok: true, data },
    });
    return (await this.sendTx(tx, label)).hash;
  }

  /** Request, fulfill on the fork and finalize, including any remaining claims. */
  async #settleDelayed(
    request: NonNullable<StrategyRoutesResult["delayed"]>,
    label: string,
  ): Promise<JourneyExecution> {
    const settle =
      this.options.settle ??
      ((environment: AnvilAccountEnvironment, account: Address) =>
        environment.makeWithdrawalsClaimable(account));
    const transactions = [await this.#send(request, `${label}: request`)];
    let intent: FinalizeParams["intent"] = request.delayed.record;
    for (let attempt = 0; attempt < MAX_CLAIMS; attempt++) {
      try {
        await settle(this.environment, this.position.creditAccount);
      } catch (error) {
        throw new JourneyUnavailable(
          "blocked",
          "Fork settlement helper could not fulfill the redemption",
          { cause: error },
        );
      }
      await this.environment.sync();
      const withdrawals = await this.sdk.positions.getCurrentWithdrawals({
        ...this.options.key,
        creditAccount: this.position.creditAccount,
      });
      const claimable = withdrawals.data.claimable[0];
      if (!claimable)
        throw new JourneyUnavailable(
          "blocked",
          "No claimable redemption after fork fulfillment; this protocol needs a settlement helper",
        );
      const data: FinalizeResult = prepared(
        await this.prepare.finalize(this.position, {
          claimable,
          intent,
          slippage: this.options.slippage,
        }),
      );
      transactions.push(await this.#send(data, `${label}: finalize`));
      if (!data.remainder)
        return {
          transactions,
          expected: projection(data.state),
          route: "delayed",
        };
      intent = data.remainder.intent;
    }
    throw new JourneyUnavailable(
      "blocked",
      `Redemption still has a remainder after ${MAX_CLAIMS} claims`,
    );
  }
}

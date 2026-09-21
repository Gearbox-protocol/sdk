import type { Address, PrivateKeyAccount } from "viem";
import { ierc20Abi } from "../abi/iERC20.js";
import type { ILogger, OnchainSDK } from "../onchain/index.js";
import { AssetsMap, SDKConstruct } from "../onchain/index.js";
import { claimFromFaucet } from "./claimFromFaucet.js";
import type { AnvilClient } from "./createAnvilClient.js";
import { createMinter } from "./mint/index.js";

/**
 * Collateral is claimed/minted with 10% on top of what the account strictly
 * needs, so that rounding in the router or a second operation on the same
 * token does not immediately run the wallet dry.
 */
export const COLLATERAL_BUFFER_NUMERATOR = 11n;
export const COLLATERAL_BUFFER_DENOMINATOR = 10n;

/**
 * Target utilization of a pool after an environment deposit, in basis points.
 * Pools stop lending above U2 (~89.5%), so depositing `amount / 0.895`
 * leaves enough idle liquidity to actually borrow `amount`.
 */
export const POOL_TARGET_UTILIZATION_BP = 8950n;

/** `amount` scaled up by `numerator / denominator`. */
export function scaleUp(
  amount: bigint,
  numerator: bigint,
  denominator: bigint,
): bigint {
  return (amount * numerator) / denominator;
}

/** How much of a single token an account must end up holding. */
export interface FundingRequirement {
  token: Address;
  /** Balance the account is guaranteed to have once funding succeeds. */
  minimum: bigint;
  /**
   * Balance to aim for when claiming or minting. Defaults to `minimum`;
   * the surplus is a buffer and is never required to be present.
   */
  target?: bigint;
}

export interface AnvilAccountFundingOptions {
  /** Mint missing balances directly on the fork when the faucet cannot cover them. */
  allowMint?: boolean;
  /** Faucet address, resolved from the address provider when omitted. */
  faucet?: Address;
  logger?: ILogger;
}

/**
 * Wallet funding on an Anvil fork: faucet claims with on-demand minting as a
 * fallback, plus the balance guarantee every environment operation relies on.
 */
export class AnvilAccountFunding extends SDKConstruct {
  public readonly allowMint: boolean;
  readonly #anvil: AnvilClient;
  readonly #logger?: ILogger;
  #faucet?: Address;

  constructor(
    sdk: OnchainSDK,
    anvil: AnvilClient,
    options: AnvilAccountFundingOptions = {},
  ) {
    super(sdk);
    this.#anvil = anvil;
    this.#faucet = options.faucet;
    this.allowMint = options.allowMint ?? false;
    this.#logger = options.logger ?? this.logger;
  }

  public get faucet(): Address {
    if (!this.#faucet) {
      try {
        this.#faucet = this.sdk.addressProvider.getAddress("FAUCET");
      } catch (error) {
        throw new Error("faucet not found", { cause: error });
      }
    }
    return this.#faucet;
  }

  public balanceOf(token: Address, account: Address): Promise<bigint> {
    return this.#anvil.readContract({
      address: token,
      abi: ierc20Abi,
      functionName: "balanceOf",
      args: [account],
    });
  }

  /**
   * Tries every supported fork minter and returns the resulting balance.
   * Individual mint-strategy failures are tolerated; balance reads may throw.
   */
  public async tryMint(
    token: Address,
    destination: Address,
    amount: bigint,
  ): Promise<bigint> {
    const minter = createMinter(this.sdk, this.#anvil, token);
    return minter.tryMint(token, destination, amount);
  }

  /**
   * Claims from the faucet, either the given assets or the faucet's default
   * amount when `claims` is omitted. Throws when the claim fails.
   */
  public async claim(
    claimer: PrivateKeyAccount,
    role: string,
    claims?: AssetsMap,
  ): Promise<void> {
    await claimFromFaucet({
      sdk: this.sdk,
      publicClient: this.#anvil,
      wallet: this.#anvil,
      faucet: this.faucet,
      claimer,
      role,
      amount: claims?.entries().map(([token, amount]) => ({ token, amount })),
      logger: this.#logger,
    });
  }

  /**
   * Guarantees that `account` holds at least `minimum` of `token`: reads the
   * balance, mints the missing amount up to `target` when minting is enabled,
   * and throws a contextual error when the balance is still insufficient.
   *
   * @returns the balance after the attempt
   */
  public async ensureTokenBalance(
    account: Address,
    token: Address,
    minimum: bigint,
    target = minimum,
  ): Promise<bigint> {
    let balance: bigint;
    try {
      balance = await this.balanceOf(token, account);
    } catch (error) {
      throw new Error(
        `failed to read ${this.labelAddress(token)} balance of ${this.labelAddress(account)}`,
        { cause: error },
      );
    }
    if (balance >= minimum) {
      return balance;
    }
    const missing = this.#fmt(token, minimum - balance);
    if (!this.allowMint) {
      throw new Error(
        `${this.labelAddress(account)} has ${this.#fmt(token, balance)} but needs ${this.#fmt(token, minimum)}: missing ${missing} and minting is disabled`,
      );
    }
    this.#logger?.debug(
      `minting ${missing} of ${this.labelAddress(token)} for ${this.labelAddress(account)}`,
    );
    try {
      balance = await this.tryMint(
        token,
        account,
        (target > minimum ? target : minimum) - balance,
      );
    } catch (error) {
      throw new Error(
        `failed to mint ${this.labelAddress(token)} for ${this.labelAddress(account)}`,
        { cause: error },
      );
    }
    if (balance < minimum) {
      throw new Error(
        `failed to fund ${this.labelAddress(account)} with ${this.#fmt(token, minimum)}: minting left it with ${this.#fmt(token, balance)}`,
      );
    }
    return balance;
  }

  /**
   * Funds `account` with everything in `requirements`, aggregating per token so
   * that several targets sharing a collateral token are claimed for once.
   *
   * The faucet is tried first; its failure is only tolerated when minting is
   * enabled, and each requirement is verified afterwards either way.
   */
  public async fund(
    account: PrivateKeyAccount,
    role: string,
    requirements: FundingRequirement[],
  ): Promise<void> {
    if (requirements.length === 0) {
      return;
    }
    const minimums = new AssetsMap();
    const targets = new AssetsMap();
    for (const { token, minimum, target } of requirements) {
      minimums.inc(token, minimum);
      targets.inc(token, target ?? minimum);
    }

    try {
      await this.claim(account, role, targets);
    } catch (error) {
      if (!this.allowMint) {
        throw new Error(
          `${role} ${account.address} failed to claim from the faucet and minting is disabled`,
          { cause: error },
        );
      }
      this.#logger?.warn(
        `${role} failed to claim from faucet, minting missing balances on demand: ${error}`,
      );
    }

    for (const [token, minimum] of minimums.entries()) {
      await this.ensureTokenBalance(
        account.address,
        token,
        minimum,
        targets.getOrZero(token),
      );
    }
    this.#logger?.debug(`funded ${role} ${account.address}`);
  }

  #fmt(token: Address, amount: bigint): string {
    return this.sdk.tokensMeta.formatBN(token, amount, { symbol: true });
  }
}

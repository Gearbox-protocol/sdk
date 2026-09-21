import type { Address, Hex } from "viem";
import type {
  CreditSuite,
  ILogger,
  MidasDegenNFT,
  OnchainSDK,
} from "../onchain/index.js";
import { AddressSet, SDKConstruct } from "../onchain/index.js";
import type { AnvilClient } from "./createAnvilClient.js";
import {
  greenlistMidasGateway,
  registerSecuritizeInvestor,
} from "./kycUtils.js";
import { unpauseMidasIssuanceVault } from "./midasUtils.js";
import { midasGatewayAbi } from "./withdrawalAbi.js";

/** The KYC gate of a credit manager, or `undefined` when it has none. */
type KycGate = Awaited<ReturnType<CreditSuite["degenNFT"]>>;

export interface KycTarget {
  creditManager: Address;
  /** Strategy token the borrower wants to end up in. */
  target: Address;
}

/**
 * Undoes one temporary fork mutation made while opening KYC access.
 * Implementations are idempotent and safe to call more than once.
 */
export type KycRestore = () => Promise<void>;

/** Collects the restorations {@link AnvilAccountKyc.withKycAccess} must run. */
export interface KycAccessScope {
  register(restore: KycRestore): void;
}

export interface KycAccessOptions {
  /**
   * When set, the setup of a single target reports its failure here and the
   * remaining targets are still set up (best-effort batch). When omitted, the
   * first failure aborts the scope after undoing the partial setup.
   */
  onTargetError?: (target: KycTarget, error: Error) => void;
}

export interface AnvilAccountKycOptions {
  /** Midas access control admin, impersonated on the fork. */
  midasAdmin: Address;
  securitizeAdminKey?: Hex;
  securitizeAdmin?: Address;
  logger?: ILogger;
}

/**
 * Runs every restoration, newest first, attempting all of them even when one
 * fails, and reports the failures together with the operation error (if any).
 */
async function restoreAll(
  restores: KycRestore[],
  operationError?: unknown,
): Promise<void> {
  const failures: unknown[] = [];
  for (const restore of [...restores].reverse()) {
    try {
      await restore();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length === 0) {
    return;
  }
  if (operationError !== undefined) {
    throw new AggregateError(
      [operationError, ...failures],
      "KYC access scope failed and could not be fully restored",
      { cause: operationError },
    );
  }
  throw new AggregateError(failures, "failed to restore the KYC access scope");
}

/**
 * Fake KYC on an Anvil fork: greenlists/registers the borrower so the credit
 * facade lets it open, and temporarily clears the pauses that block issuance.
 */
export class AnvilAccountKyc extends SDKConstruct {
  readonly #anvil: AnvilClient;
  readonly #logger?: ILogger;
  readonly #midasAdmin: Address;
  readonly #securitizeAdminKey?: Hex;
  readonly #securitizeAdmin?: Address;

  constructor(
    sdk: OnchainSDK,
    anvil: AnvilClient,
    options: AnvilAccountKycOptions,
  ) {
    super(sdk);
    this.#anvil = anvil;
    this.#midasAdmin = options.midasAdmin;
    this.#securitizeAdminKey = options.securitizeAdminKey;
    this.#securitizeAdmin = options.securitizeAdmin;
    this.#logger = options.logger ?? this.logger;
  }

  /**
   * Loads the KYC gate of a credit manager. `undefined` means the credit
   * manager has no gate; a gate that cannot be read throws, so that a failed
   * load is never mistaken for an ungated credit manager.
   */
  public async loadKycGate(cm: CreditSuite): Promise<KycGate> {
    try {
      return await cm.degenNFT();
    } catch (error) {
      throw new Error(`failed to load the KYC gate of ${cm.name}`, {
        cause: error,
      });
    }
  }

  /**
   * Opens KYC access for `investor` on every target, runs `callback`, and then
   * restores what it changed.
   *
   * Restorations only put back the issuance-vault pause state that was cleared
   * for the callback; greenlist roles, registry entries and access-control
   * grants stay on the fork.
   *
   * Errors are never swallowed: a callback failure is rethrown after the
   * restorations run, and restoration failures surface as an `AggregateError`
   * whose `cause` is the original failure (when there was one).
   */
  public async withKycAccess<T>(
    investor: Address,
    targets: KycTarget[],
    callback: () => Promise<T>,
    options: KycAccessOptions = {},
  ): Promise<T> {
    const restores: KycRestore[] = [];
    const scope: KycAccessScope = {
      register: restore => {
        restores.push(restore);
      },
    };
    const greenlisted = new AddressSet();

    try {
      for (const target of targets) {
        try {
          await this.#setupTarget(investor, target, scope, greenlisted);
        } catch (error) {
          const contextual = new Error(
            `failed to pass KYC for ${this.labelAddress(target.creditManager)}`,
            { cause: error },
          );
          if (!options.onTargetError) {
            throw contextual;
          }
          options.onTargetError(target, contextual);
        }
      }
    } catch (setupError) {
      // partial setup must not leak fork mutations
      await restoreAll(restores, setupError);
      throw setupError;
    }

    let result: T;
    try {
      result = await callback();
    } catch (error) {
      await restoreAll(restores, error);
      throw error;
    }
    await restoreAll(restores);
    return result;
  }

  async #setupTarget(
    investor: Address,
    { creditManager, target }: KycTarget,
    scope: KycAccessScope,
    greenlisted: AddressSet,
  ): Promise<void> {
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const gate = await this.loadKycGate(cm);
    if (gate?.protocol === "midas") {
      const { gateway } = gate as MidasDegenNFT;
      if (greenlisted.has(gateway)) {
        return;
      }
      await greenlistMidasGateway({
        anvil: this.#anvil,
        investor,
        admin: this.#midasAdmin,
        gateway,
        logger: this.#logger,
      });
      const vault = await this.#anvil.readContract({
        address: gateway,
        abi: midasGatewayAbi,
        functionName: "midasIssuanceVault",
      });
      scope.register(
        await unpauseMidasIssuanceVault({
          anvil: this.#anvil,
          vault,
          admin: this.#midasAdmin,
          logger: this.#logger,
        }),
      );
      // only skip the gateway next time once it is fully set up
      greenlisted.add(gateway);
    } else if (gate?.protocol === "securitize") {
      const requirements = await this.sdk.accounts.getOpenAccountRequirements(
        investor,
        creditManager,
        { tokenOutAddress: target },
      );
      if (requirements?.protocol !== "securitize") {
        return;
      }
      const tokens = requirements.securitizeTokensToRegister;
      if (tokens.length === 0) {
        return;
      }
      if (!this.#securitizeAdminKey && !this.#securitizeAdmin) {
        throw new Error(
          `securitize: ${investor} is not registered in ${tokens.join(", ")} and no registry admin is configured`,
        );
      }
      for (const token of tokens) {
        await registerSecuritizeInvestor({
          anvil: this.#anvil,
          investor,
          adminPrivateKey: this.#securitizeAdminKey,
          admin: this.#securitizeAdmin,
          token,
          logger: this.#logger,
        });
      }
    }
  }
}

import { type Address, isAddressEqual } from "viem";
import type {
  CreditSuite,
  ILogger,
  MidasDegenNFT,
  OnchainSDK,
} from "../onchain/index.js";
import {
  AddressSet,
  MidasGatewayAdapterContract,
  MidasIssuanceVaultAdapterContract,
  SDKConstruct,
} from "../onchain/index.js";
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

export interface KycAccessOptions {
  /**
   * When set, the setup of a single target reports its failure here and the
   * remaining targets are still set up (best-effort batch). When omitted, the
   * first failure throws.
   */
  onTargetError?: (target: KycTarget, error: Error) => void;
}

export interface AnvilAccountKycOptions {
  /** Midas access control admin, impersonated on the fork. */
  midasAdmin: Address;
  logger?: ILogger;
}

/**
 * Fake KYC on an Anvil fork: greenlists/registers the borrower so the credit
 * facade lets it open, and clears the pauses that block issuance.
 */
export class AnvilAccountKyc extends SDKConstruct {
  readonly #anvil: AnvilClient;
  readonly #logger?: ILogger;
  readonly #midasAdmin: Address;

  constructor(
    sdk: OnchainSDK,
    anvil: AnvilClient,
    options: AnvilAccountKycOptions,
  ) {
    super(sdk);
    this.#anvil = anvil;
    this.#midasAdmin = options.midasAdmin;
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

  /** Whether the account needs KYC before it can acquire the strategy token. */
  public async requiresAccountKyc({
    creditManager,
    target,
  }: KycTarget): Promise<boolean> {
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    if ((await this.loadKycGate(cm))?.protocol !== "midas") return false;
    for (const adapter of cm.creditManager.adapters.values()) {
      if (
        adapter instanceof MidasGatewayAdapterContract &&
        isAddressEqual(adapter.mToken, target) &&
        (await adapter.openingCalls()).length > 0
      )
        return false;
    }
    return true;
  }

  /**
   * Opens KYC access for `investor` on every target. Greenlist roles, registry
   * entries, access-control grants and cleared issuance-vault pauses all stay
   * on the fork.
   */
  public async grantKycAccess(
    investor: Address,
    targets: KycTarget[],
    options: KycAccessOptions = {},
  ): Promise<void> {
    const greenlisted = new AddressSet();
    for (const target of targets) {
      try {
        await this.#setupTarget(investor, target, greenlisted);
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
  }

  async #setupTarget(
    investor: Address,
    { creditManager, target }: KycTarget,
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
      // Some suites (e.g. mGLOBAL) issue through a separate adapter and
      // have a redemption-only gateway with no issuance-vault getter.
      const issuanceAdapter = [...cm.creditManager.adapters.values()].find(
        adapter =>
          adapter instanceof MidasIssuanceVaultAdapterContract &&
          isAddressEqual(adapter.mToken, target),
      );
      const vault =
        issuanceAdapter?.targetContract ??
        (await this.#anvil.readContract({
          address: gateway,
          abi: midasGatewayAbi,
          functionName: "midasIssuanceVault",
        }));
      await unpauseMidasIssuanceVault({
        anvil: this.#anvil,
        vault,
        admin: this.#midasAdmin,
        logger: this.#logger,
      });
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
      // The helper finds each token's registry admin and impersonates it.
      for (const token of tokens) {
        await registerSecuritizeInvestor({
          anvil: this.#anvil,
          investor,
          token,
          logger: this.#logger,
        });
      }
    }
  }
}

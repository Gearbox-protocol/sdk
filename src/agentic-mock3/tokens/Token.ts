import type { Address } from "viem";
import { ADDRESS_0X0 } from "../../sdk/index.js";
import {
  type Caps,
  GearboxEntity,
  type Mode,
  ModeNotAvailableError,
  type SDKContext,
} from "../core/index.js";
import type * as offchain from "../offchain/index.js";
import type { PoolOpportunityCollection } from "../opportunity/index.js";
import type {
  CommonTokenCaps,
  OffchainTokenCaps,
  OnchainTokenMetaData,
} from "./types.js";

export type TokenType<M extends Mode> = CommonTokenCaps & Caps<M, "Token">;

// ============================================================================
// Implementation
// ============================================================================

export class Token extends GearboxEntity implements CommonTokenCaps {
  #onchain: OnchainTokenMetaData | undefined;
  #offchain: offchain.TokenRef | undefined;

  constructor(
    ctx: SDKContext<Mode>,
    offchain: offchain.TokenRef | undefined,
    onchain: OnchainTokenMetaData | undefined,
  ) {
    super(ctx);
    this.#offchain = offchain;
    this.#onchain = onchain;
  }

  // ============================================================================
  // Common
  // ============================================================================

  public get chainId(): number {
    return this.#offchain?.chainId ?? this.#onchain?.chainId ?? 0;
  }

  public get address(): Address {
    return this.#offchain?.address ?? this.#onchain?.addr ?? ADDRESS_0X0;
  }

  public get symbol(): string {
    return this.#offchain?.symbol ?? this.#onchain?.symbol ?? "";
  }

  public get decimals(): number {
    return this.#offchain?.decimals ?? this.#onchain?.decimals ?? 0;
  }

  // ============================================================================
  // Onchain
  // ============================================================================

  private get onchainData(): OnchainTokenMetaData {
    if (!this.#onchain) {
      throw new ModeNotAvailableError("onchain", this.constructor.name);
    }
    return this.#onchain;
  }

  public get name(): string {
    return this.onchainData.name;
  }

  // ============================================================================
  // Offchain
  // ============================================================================
  private get offchainData(): offchain.TokenRef {
    if (!this.#offchain) {
      throw new ModeNotAvailableError("offchain", this.constructor.name);
    }
    return this.#offchain;
  }

  public get ticker(): string {
    return this.offchainData.ticker;
  }

  public get tokenType(): OffchainTokenCaps["tokenType"] {
    return this.offchainData.type;
  }

  public get price(): number {
    return this.offchainData.price;
  }

  // ============================================================================
  // Navigation -- reverse link into opportunities
  // ============================================================================

  public poolOpportunities(): PoolOpportunityCollection<Mode> {
    return this.ctx.opportunities.pools().withUnderlying(this.address);
  }
}

import type { MultichainSDK } from "../../sdk/index.js";
import type { OffchainSDK } from "../offchain/index.js";
import type { SDKContext } from "./context.js";
import { ModeNotAvailableError } from "./errors.js";

export abstract class GearboxEntity {
  readonly #multichain: MultichainSDK | null;
  readonly #offchain: OffchainSDK | null;

  constructor(ctx: SDKContext) {
    this.#multichain = ctx.multichain;
    this.#offchain = ctx.offchain;
  }

  protected get multichain(): MultichainSDK {
    if (!this.#multichain) {
      throw new ModeNotAvailableError("onchain", this.constructor.name);
    }
    return this.#multichain;
  }

  protected get offchain(): OffchainSDK {
    if (!this.#offchain) {
      throw new ModeNotAvailableError("offchain", this.constructor.name);
    }
    return this.#offchain;
  }

  protected get multichainOrNull(): MultichainSDK | null {
    return this.#multichain;
  }

  protected get offchainOrNull(): OffchainSDK | null {
    return this.#offchain;
  }

  protected get ctx(): SDKContext {
    return { multichain: this.#multichain, offchain: this.#offchain };
  }
}

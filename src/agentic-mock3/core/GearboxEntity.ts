import type { MultichainSDK } from "../../sdk/index.js";
import type { OffchainSDK } from "../offchain/index.js";
import type { SDKContext } from "./context.js";
import { ModeNotAvailableError } from "./errors.js";
import type { Mode } from "./mode.js";

export abstract class GearboxEntity {
  readonly #ctx: SDKContext<Mode>;

  constructor(ctx: SDKContext<Mode>) {
    this.#ctx = ctx;
  }

  protected get multichain(): MultichainSDK {
    if (!this.#ctx.multichain) {
      throw new ModeNotAvailableError("onchain", this.constructor.name);
    }
    return this.#ctx.multichain;
  }

  protected get offchain(): OffchainSDK {
    if (!this.#ctx.offchain) {
      throw new ModeNotAvailableError("offchain", this.constructor.name);
    }
    return this.#ctx.offchain;
  }

  protected get multichainOrNull(): MultichainSDK | null {
    return this.#ctx.multichain;
  }

  protected get offchainOrNull(): OffchainSDK | null {
    return this.#ctx.offchain;
  }

  /**
   * Full SDK handle. Entities reach sibling namespaces via `this.ctx.tokens`,
   * `this.ctx.opportunities`, etc.
   */
  protected get ctx(): SDKContext<Mode> {
    return this.#ctx;
  }
}

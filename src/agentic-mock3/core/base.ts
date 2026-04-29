import type { MockOffchainSDK } from "../offchain/index.js";
import type { MockMultichainSDK } from "../onchain/index.js";
import type { SDKContext } from "./context.js";

export abstract class GearboxEntity {
  readonly #multichain: MockMultichainSDK | null;
  readonly #offchain: MockOffchainSDK | null;

  constructor(ctx: SDKContext) {
    this.#multichain = ctx.multichain;
    this.#offchain = ctx.offchain;
  }

  protected get multichain(): MockMultichainSDK {
    if (!this.#multichain) throw new Error("Onchain mode is not available");
    return this.#multichain;
  }

  protected get offchain(): MockOffchainSDK {
    if (!this.#offchain) throw new Error("Offchain mode is not available");
    return this.#offchain;
  }

  protected get multichainOrNull(): MockMultichainSDK | null {
    return this.#multichain;
  }

  protected get offchainOrNull(): MockOffchainSDK | null {
    return this.#offchain;
  }

  protected get ctx(): SDKContext {
    return { multichain: this.#multichain, offchain: this.#offchain };
  }
}

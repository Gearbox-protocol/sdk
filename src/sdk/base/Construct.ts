import type { Address, Chain, PublicClient, Transport } from "viem";

import type { GearboxChain, NetworkType } from "../chain/index.js";
import type { ILogger } from "../types/index.js";
import { childLogger } from "../utils/index.js";
import { ChainContractsRegister } from "./ChainContractsRegister.js";
import type { TokensMeta } from "./TokensMeta.js";

export type ConstructOptions =
  | ChainContractsRegister
  | {
      client: PublicClient<Transport, Chain>;
      logger?: ILogger;
    }
  | {
      register: ChainContractsRegister;
      logger?: ILogger;
    };

export class Construct {
  public readonly logger?: ILogger;
  public readonly client: PublicClient<Transport, Chain>;
  readonly #register?: ChainContractsRegister;
  /**
   * Indicates that contract state needs to be updated
   */
  #dirty = false;

  constructor(options: ConstructOptions) {
    if (options instanceof ChainContractsRegister) {
      this.#register = options;
      this.client = options.client;
    } else if ("register" in options) {
      this.#register = options.register;
      this.client = options.register.client;
    } else {
      this.client = options.client;
    }
    this.logger = childLogger(
      this.constructor.name,
      this.#register?.logger ?? options.logger,
    );
  }

  /**
   * Throws if register was not provided in constructor options
   * Ephemeral contracts that do not need to access other contracts may not need it
   */
  public get register(): ChainContractsRegister {
    if (!this.#register) {
      throw new Error(
        "contracts register not available, it must be provided if contract needs to access other contracts",
      );
    }
    return this.#register;
  }

  protected safeGetRegister(): ChainContractsRegister | undefined {
    return this.#register;
  }

  public get chain(): Chain {
    return this.client.chain;
  }

  public get chainId(): number {
    return this.client.chain.id;
  }

  public get networkType(): NetworkType {
    if ("network" in this.chain) {
      return (this.chain as GearboxChain).network;
    }
    throw new Error(`chain ${this.chain.id} is not a Gearbox SDK chain`);
  }

  /**
   * Indicates that contract state diverged from onchain state and needs to be updated
   */
  public get dirty(): boolean {
    return this.#dirty;
  }

  protected set dirty(value: boolean) {
    this.#dirty = value;
  }

  protected get tokensMeta(): TokensMeta {
    return this.register.tokensMeta;
  }

  protected labelAddress(address: Address, omitAddress?: boolean): string {
    return this.#register?.labelAddress(address, omitAddress) ?? address;
  }

  /**
   * Returns list of addresses that should be watched for events to sync state
   */
  public get watchAddresses(): Set<Address> {
    return new Set();
  }
}

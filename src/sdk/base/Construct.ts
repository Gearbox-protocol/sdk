import type { Address, Chain, PublicClient, Transport } from "viem";

import type { GearboxChain, NetworkType } from "../chain/index.js";
import type { ILogger } from "../types/index.js";
import { childLogger } from "../utils/index.js";
import { ChainContractsRegister } from "./ChainContractsRegister.js";
import type { TokensMeta } from "./TokensMeta.js";

export interface ConstructOptions {
  client: PublicClient<Transport, Chain>;
  logger?: ILogger;
}

export class Construct {
  public readonly logger?: ILogger;
  public readonly client: PublicClient<Transport, Chain>;
  public readonly register: ChainContractsRegister;
  /**
   * Indicates that contract state needs to be updated
   */
  #dirty = false;

  constructor({ client, logger }: ConstructOptions) {
    this.client = client;
    this.register = ChainContractsRegister.for(client, logger);
    this.logger = childLogger(
      this.constructor.name,
      this.register.logger ?? logger,
    );
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

  /**
   * Syntax sugar for rgister.tokensMeta
   */
  protected get tokensMeta(): TokensMeta {
    return this.register.tokensMeta;
  }

  /**
   * Syntax suggar for getting contract labels
   * @param address
   * @returns
   */
  protected labelAddress(address: Address): string {
    return this.register.labelAddress(address);
  }

  /**
   * Returns list of addresses that should be watched for events to sync state
   */
  public get watchAddresses(): Set<Address> {
    return new Set();
  }
}

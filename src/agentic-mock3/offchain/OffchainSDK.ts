import axios, { type AxiosInstance } from "axios";
import {
  AddressMap,
  getChain,
  type ILogger,
  type NetworkType,
} from "../../sdk/index.js";
import { MOCK_DATA } from "./mock-data/index.js";
import type {
  OffchainStateSnapshot,
  Opportunity,
  TokenRef,
} from "./types/index.js";

export interface OffchainSDKConfig {
  networks?: NetworkType[];
  apiUrl?: string;
  logger?: ILogger;
}

export class OffchainSDK {
  readonly #api: AxiosInstance;

  #attached = false;
  #networks?: NetworkType[];
  #state?: OffchainStateSnapshot;
  #logger?: ILogger;

  constructor(config?: OffchainSDKConfig) {
    this.#networks = config?.networks;
    this.#api = axios.create({
      baseURL: config?.apiUrl ?? `https://api.gear-dev.dev`,
    });
    this.#logger = config?.logger;
  }

  public async attach(): Promise<void> {
    if (!this.#networks) {
      this.#networks = await this.#loadChains();
    }
    this.#state = MOCK_DATA;
    this.#attached = true;
  }

  public get state(): OffchainStateSnapshot {
    if (!this.#attached || !this.#state) {
      throw new Error("SDK is not attached");
    }
    return this.#state;
  }

  public get networks(): NetworkType[] {
    if (!this.#attached || !this.#networks) {
      throw new Error("SDK is not attached");
    }
    return this.#networks;
  }

  public get opportunities(): Opportunity[] {
    if (!this.#attached || !this.#state) {
      throw new Error("SDK is not attached");
    }
    return this.#state.opportunities;
  }

  public get tokens(): TokenRef[] {
    // TODO: get something better from backend
    const result = new AddressMap<TokenRef>();
    for (const o of this.opportunities) {
      result.upsert(o.underlyingToken.address, o.underlyingToken);
      for (const c of o.collaterals) {
        result.upsert(c.token.address, c.token);
      }
      if (o.type === "pool") {
        for (const i of o.yield.incentives) {
          if (i.type === "tokens") {
            result.upsert(i.rewardToken.address, i.rewardToken);
          }
        }
      } else {
        for (const i of o.baseTargetCollateralYield.incentives) {
          if (i.type === "tokens") {
            result.upsert(i.rewardToken.address, i.rewardToken);
          }
        }
      }
    }
    return result.values();
  }

  async #loadChains(): Promise<NetworkType[]> {
    // chain/list
    const response = await this.#api.get("/chain/list");
    const data = response.data as Array<{ chainId: number }>;
    return data.map(d => getChain(d.chainId).network);
  }
}

import type { Address } from "viem";
import type { ChainId, DataResponse } from "../../model/index.js";
import type { MultichainSDK } from "../../onchain/index.js";
import type { Reward, RewardsServiceKeys } from "../../rewards/index.js";
import { RewardsService } from "../../rewards/index.js";
import type { EnsureFreshChains, NamespaceOptions } from "../types.js";
import type { IRewards } from "./types.js";

/**
 * {@inheritDoc IRewards}
 **/
export class RewardsNamespace implements IRewards {
  readonly #rewards: RewardsService;
  readonly #ensureFresh?: EnsureFreshChains;

  constructor(
    onchain: MultichainSDK,
    keys: RewardsServiceKeys | undefined,
    options: NamespaceOptions,
  ) {
    this.#rewards = new RewardsService(onchain, keys);
    this.#ensureFresh = options.ensureFresh;
  }

  /**
   * {@inheritDoc IRewards.list}
   **/
  public async list(
    wallet: Address,
    chainIds?: ChainId[],
  ): Promise<DataResponse<Reward[]>> {
    await this.#ensureFresh?.(chainIds);
    return this.#rewards.list(wallet, chainIds);
  }
}

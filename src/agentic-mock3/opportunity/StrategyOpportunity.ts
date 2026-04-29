import {
  type Address,
  GearboxEntity,
  type NetworkType,
  type RawTx,
  type SDKContext,
} from "../core/index.js";
import { Curator } from "../curator/entity.js";
import { Market } from "../market/entity.js";
import type { OffchainStrategyOpportunity } from "../offchain/index.js";
import type { OnchainMarketData } from "../onchain/index.js";
import type { OpportunityBase } from "./entity";

export class StrategyOpportunity
  extends GearboxEntity
  implements OpportunityBase
{
  readonly #offchain: OffchainStrategyOpportunity;
  readonly #onchain: OnchainMarketData | undefined;

  readonly type = "strategy" as const;

  constructor(
    ctx: SDKContext,
    offchain: OffchainStrategyOpportunity,
    onchain: OnchainMarketData | undefined,
  ) {
    super(ctx);
    this.#offchain = offchain;
    this.#onchain = onchain;
  }

  get id(): string {
    return this.#offchain.id;
  }
  get chainId(): number {
    return this.#offchain.chainId;
  }
  get title(): string {
    return this.#offchain.title;
  }
  get curatorName(): string {
    return this.#offchain.curatorName;
  }
  get poolAddress(): Address {
    return this.#offchain.poolAddress;
  }
  get underlying(): Address {
    return this.#offchain.underlying;
  }
  get permissionless(): boolean {
    return this.#offchain.permissionless;
  }
  get kycRequired(): boolean {
    return this.#offchain.kycRequired;
  }

  // -- Strategy-specific -----------------------------------------------------

  get creditManagerAddress(): Address {
    return this.#offchain.creditManagerAddress;
  }
  get borrowApy(): number {
    return this.#offchain.borrowApy;
  }
  get maxLeverage(): number {
    return this.#offchain.maxLeverage;
  }
  get basicApy(): number {
    return this.#offchain.basicApy;
  }
  get maxLeverageApy(): number {
    return this.#offchain.maxLeverageApy;
  }
  get minDebt(): bigint {
    return this.#offchain.minDebt;
  }
  get maxDebt(): bigint {
    return this.#offchain.maxDebt;
  }

  // -- Onchain ops -----------------------------------------------------------

  createDepositTx(amount: bigint): RawTx {
    const network = this.#resolveNetwork();
    return this.multichain
      .chain(network)
      .createDepositTx(this.poolAddress, amount);
  }

  // -- Navigation ------------------------------------------------------------

  get market(): Market {
    const network = this.#resolveNetwork();
    const offMarket = this.offchain.findMarket(network, this.poolAddress);
    return new Market(this.ctx, offMarket, this.#onchain);
  }

  get curator(): Curator | undefined {
    const offCurator = this.offchain.findCurator(this.curatorName);
    if (!offCurator) return undefined;
    return new Curator(this.ctx, offCurator);
  }

  #resolveNetwork(): NetworkType {
    return this.offchain.markets.find(m => m.pool.address === this.poolAddress)
      ?.network as NetworkType;
  }
}

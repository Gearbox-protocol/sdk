import type { Address } from "viem";

import type { MarketData } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { PoolSuiteStateHuman } from "../../types/index.js";
import type { MarketConfiguratorContract } from "../MarketConfiguratorContract.js";
import type { IRWAFactory } from "../rwa/types.js";
import createInterestRateModel from "./createInterestRateModel.js";
import createPool from "./createPool.js";
import createPoolQuotaKeeper from "./createPoolQuotaKeeper.js";
import createRateKeeper from "./createRateKeeper.js";
import { GaugeContract } from "./GaugeContract.js";
import { LinearInterestRateModelContract } from "./LinearInterestRateModelContract.js";
import { TumblerContract } from "./TumblerContract.js";
import type {
  IInterestRateModelContract,
  IRateKeeperContract,
  PoolContract,
  PoolQuotaKeeperContract,
} from "./types.js";

/**
 * SDK aggregate for the pool-side contracts of a Gearbox market.
 *
 * @remarks
 * The pool is the market's passive liquidity source. This suite groups the
 * ERC-4626 pool wrapper with the quota keeper that caps collateral-side
 * exposure, the rate keeper that supplies quota rates, and the interest-rate
 * model that prices pool utilization. Higher-level market and pool services use
 * this class when they need the complete pool control plane instead of a single
 * contract wrapper.
 */
export class PoolSuite extends SDKConstruct {
  /**
   * ERC-4626 liquidity pool wrapper for deposits, withdrawals, borrowing
   * limits, and base interest accounting.
   */
  public readonly pool: PoolContract;
  /**
   * Quota keeper wrapper that tracks per-token quota limits, quoted exposure,
   * quota rates, and credit-manager access.
   */
  public readonly pqk: PoolQuotaKeeperContract;
  /**
   * Rate keeper used by the quota keeper to obtain collateral-specific quota
   * rates. Can be a {@link GaugeContract} or a {@link TumblerContract}.
   */
  public readonly rateKeeper: IRateKeeperContract;
  /**
   * Interest-rate model used by the pool to calculate the base borrow rate from
   * expected and available liquidity.
   */
  public readonly interestRateModel: IInterestRateModelContract;

  #marketConfigurator: Address;

  /**
   * Creates the pool aggregate from a market compressor snapshot.
   *
   * @param sdk - Attached SDK instance
   * @param data - Full market snapshot containing pool, quota, rate, and
   * interest-rate model state.
   */
  constructor(sdk: OnchainSDK, data: MarketData) {
    super(sdk);
    this.pool = createPool(sdk, data.pool);
    this.pqk = createPoolQuotaKeeper(sdk, data.pool, data.quotaKeeper);
    this.rateKeeper = createRateKeeper(sdk, data.pool, data.rateKeeper);
    this.interestRateModel = createInterestRateModel(
      sdk,
      data.interestRateModel,
    );
    this.#marketConfigurator = data.configurator;
  }

  /**
   * Narrows `rateKeeper` to a gauge rate keeper.
   *
   * @throws If the market uses a different rate keeper type.
   */
  public get gauge(): GaugeContract {
    if (this.rateKeeper instanceof GaugeContract) {
      return this.rateKeeper;
    }
    throw new Error(
      `Rate keeper is not a gauge, but a ${this.rateKeeper.contractType}`,
    );
  }

  /**
   * Narrows `rateKeeper` to a tumbler rate keeper.
   *
   * @throws If the market uses a different rate keeper type.
   */
  public get tumbler(): TumblerContract {
    if (this.rateKeeper instanceof TumblerContract) {
      return this.rateKeeper;
    }
    throw new Error(
      `Rate keeper is not a tumbler, but a ${this.rateKeeper.contractType}`,
    );
  }

  /**
   * Narrows `interestRateModel` to the linear interest-rate model.
   *
   * @throws If the market uses a different interest-rate model type.
   */
  public get linearModel(): LinearInterestRateModelContract {
    if (this.interestRateModel instanceof LinearInterestRateModelContract) {
      return this.interestRateModel;
    }
    throw new Error(
      `Interest rate model is not a linear model, but a ${this.interestRateModel.contractType}`,
    );
  }

  /**
   * Market configurator that governs the pool and its connected credit suites.
   *
   * @throws If the configurator is missing from the SDK contract register.
   */
  public get marketConfigurator(): MarketConfiguratorContract {
    return this.register.mustGetContract<MarketConfiguratorContract>(
      this.#marketConfigurator,
    );
  }

  /**
   * Underlying asset deposited into the pool and borrowed by connected credit
   * suites.
   */
  public get underlying(): Address {
    return this.pool.underlying;
  }

  /**
   * RWA factory associated with the pool's underlying, undefined for non-RWA markets.
   */
  public get rwaFactory(): IRWAFactory | undefined {
    return this.pool.rwaFactory;
  }

  /**
   * Whether any pool-side wrapper has observed logs that require a resync.
   */
  override get dirty(): boolean {
    return (
      this.pool.dirty ||
      this.rateKeeper.dirty ||
      this.pqk.dirty ||
      this.interestRateModel.dirty
    );
  }

  /**
   * Pool-side contract addresses whose logs are enough to detect stale state.
   *
   * @internal
   */
  public override get watchAddresses(): Set<Address> {
    return new Set([
      this.pool.address,
      this.pqk.address,
      this.rateKeeper.address,
      this.interestRateModel.address,
    ]);
  }

  /**
   * Returns a label-enriched, JSON-friendly view of the pool-side state.
   *
   * @param raw - Whether child wrappers should keep raw numeric values instead
   * of applying human formatting where they support both modes.
   */
  public stateHuman(raw = true): PoolSuiteStateHuman {
    return {
      pool: this.pool.stateHuman(raw),
      poolQuotaKeeper: this.pqk.stateHuman(raw),
      interestRateModel: this.interestRateModel.stateHuman(raw),
      rateKeeper: this.rateKeeper.stateHuman(raw),
    };
  }
}

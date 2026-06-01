import type { Address } from "viem";

import type { CreditSuiteState } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { IRouterContract } from "../../router/index.js";
import type { CreditSuiteStateHuman } from "../../types/index.js";
import type { MarketConfiguratorContract } from "../MarketConfiguratorContract.js";
import type { MarketSuite } from "../MarketSuite.js";
import createCreditConfigurator from "./createCreditConfigurator.js";
import createCreditFacade from "./createCreditFacade.js";
import createCreditManager from "./createCreditManager.js";
import type {
  ICreditConfiguratorContract,
  ICreditFacadeContract,
  ICreditManagerContract,
} from "./types.js";

/**
 * SDK aggregate for one credit-manager branch inside a market.
 *
 * @remarks
 * This is the market's "retail branch": it borrows
 * liquidity from the pool to open credit accounts under an isolated mandate.
 * The suite groups the three contracts that define that branch:
 * `creditManager` for debt, collateral, adapters, and account accounting;
 * `creditFacade` for user-facing account operations and multicalls; and
 * `creditConfigurator` for risk-parameter and adapter configuration.
 */
export class CreditSuite extends SDKConstruct {
  /**
   * Pool that supplies underlying liquidity to this credit manager.
   */
  public readonly pool: Address;

  /**
   * Wrapper around the core credit manager contract.
   *
   * @remarks
   * The credit manager owns account accounting, collateral checks, enabled
   * collateral token masks, adapter mappings, debt updates, and liquidation
   * calculations for this branch.
   */
  public readonly creditManager: ICreditManagerContract;
  /**
   * Wrapper around the credit facade contract used to build account
   * transactions such as open, close, liquidate, and multicall.
   */
  public readonly creditFacade: ICreditFacadeContract;
  /**
   * Wrapper around the credit configurator that mutates risk
   * parameters, collateral tokens, adapter permissions, and facade settings.
   */
  public readonly creditConfigurator: ICreditConfiguratorContract;

  /**
   * Original compressor contract snapshot for this credit suite.
   */
  public readonly state: CreditSuiteState;
  /**
   * Human-readable credit manager name from the core contract state.
   */
  public readonly name: string;

  /**
   * Creates a credit suite from one entry in a market compressor snapshot.
   *
   * @param sdk - Attached SDK instance.
   * @param data - Parent market snapshot part that contains the credit suite data.
   */
  constructor(sdk: OnchainSDK, data: CreditSuiteState) {
    super(sdk);
    this.name = data.creditManager.name;

    this.state = data;
    this.pool = data.creditManager.pool;

    this.creditManager = createCreditManager(sdk, this.state);
    this.creditFacade = createCreditFacade(sdk, this.state);
    this.creditConfigurator = createCreditConfigurator(sdk, this.state);
  }

  /**
   * Token borrowed from the pool and used as the account debt asset.
   */
  public get underlying(): Address {
    return this.creditManager.underlying;
  }

  /**
   * Parent market that contains this credit manager
   */
  public get market(): MarketSuite {
    return this.sdk.marketRegister.findByCreditManager(
      this.creditManager.address,
    );
  }

  /**
   * Market configurator that governs this credit suite and its parent pool.
   */
  public get marketConfigurator(): MarketConfiguratorContract {
    return this.market.configurator;
  }

  /**
   * Router configured for this credit suite.
   */
  public get router(): IRouterContract {
    return this.sdk.routerFor(this);
  }

  /**
   * Whether this suite's facade is past its configured expiration timestamp.
   *
   * @remarks
   * Expired credit suites can have different liquidation parameters on-chain.
   * Non-expirable facades and facades with zero expiration are treated as not
   * expired.
   */
  public get isExpired(): boolean {
    return (
      this.creditFacade.expirable &&
      this.creditFacade.expirationDate > 0 &&
      this.creditFacade.expirationDate < this.sdk.timestamp
    );
  }

  /**
   * Whether the facade, manager, or configurator has observed logs that require
   * a credit-suite resync.
   */
  override get dirty(): boolean {
    // TODO: any other ways to get dirty, adapters maybe?
    return (
      this.creditFacade.dirty ||
      this.creditManager.dirty ||
      this.creditConfigurator.dirty
    );
  }

  /**
   * Credit contracts whose events are enough to detect stale suite state.
   *
   * @internal
   */
  public override get watchAddresses(): Set<Address> {
    return new Set([
      this.creditConfigurator.address,
      this.creditManager.address,
      this.creditFacade.address,
    ]);
  }

  /**
   * Returns a label-enriched, JSON-friendly view of this credit suite.
   *
   * @param raw - Whether child wrappers should keep raw numeric values instead
   * of applying human formatting where they support both modes.
   */
  public stateHuman(raw = true): CreditSuiteStateHuman {
    return {
      isExpired: this.isExpired,
      creditFacade: this.creditFacade.stateHuman(raw),
      creditManager: this.creditManager.stateHuman(raw),
      creditConfigurator: this.creditConfigurator.stateHuman(raw),
    };
  }
}

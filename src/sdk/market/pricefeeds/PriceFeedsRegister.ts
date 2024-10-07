import type { Address, Hex } from "viem";

import { type PriceFeedTreeNode, SDKConstruct } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { ILogger, RawTx } from "../../types";
import { AddressMap, bytes32ToString, childLogger } from "../../utils";
import type { IHooks } from "../../utils/internal";
import { Hooks } from "../../utils/internal";
import { BalancerStablePriceFeedContract } from "./BalancerStablePriceFeed";
import { BalancerWeightedPriceFeedContract } from "./BalancerWeightedPriceFeed";
import { BoundedPriceFeedContract } from "./BoundedPriceFeed";
import { ChainlinkPriceFeedContract } from "./ChainlinkPriceFeed";
import { CompositePriceFeedContract } from "./CompositePriceFeed";
import { CurveCryptoPriceFeedContract } from "./CurveCryptoPriceFeed";
import { CurveStablePriceFeedContract } from "./CurveStablePriceFeed";
import { CurveUSDPriceFeedContract } from "./CurveUSDPriceFeed";
import { Erc4626PriceFeedContract } from "./Erc4626PriceFeed";
import { MellowLRTPriceFeedContract } from "./MellowLRTPriceFeed";
import { RedstonePriceFeedContract } from "./RedstonePriceFeed";
import { RedstoneUpdater } from "./RedstoneUpdater";
import type {
  IPriceFeedContract,
  PriceFeedContractType,
  UpdatePriceFeedsResult,
} from "./types";
import { WstETHPriceFeedContract } from "./WstETHPriceFeed";
import { YearnPriceFeedContract } from "./YearnPriceFeed";
import { ZeroPriceFeedContract } from "./ZeroPriceFeed";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PriceFeedRegisterHooks = {
  /**
   * Emitted when transactions to update price feeds have been generated, but before they're used anywhere
   */
  updatesGenerated: [UpdatePriceFeedsResult];
};

/**
 * PriceFeedRegister acts as a chain-level cache to avoid creating multiple contract instances.
 * It's reused by PriceFeedFactory belonging to different markets
 *
 **/
export class PriceFeedRegister
  extends SDKConstruct
  implements IHooks<PriceFeedRegisterHooks>
{
  public readonly logger?: ILogger;
  readonly #hooks = new Hooks<PriceFeedRegisterHooks>();
  #feeds = new AddressMap<IPriceFeedContract>();
  #redstoneUpdater: RedstoneUpdater;

  // public readonly zeroPriceFeed: ZeroPriceFeedContract;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.logger = childLogger("PriceFeedRegister", sdk.logger);
    this.#redstoneUpdater = new RedstoneUpdater(sdk);
    // TODO: creating zero price feed. do we even need it here, or only in deploy-v3?
    // const zeroPriceFeed = sdk.addressProvider.getAddress(AP_ZERO_PRICE_FEED);
    // this.zeroPriceFeed = new ZeroPriceFeedContract({});
  }

  public addHook = this.#hooks.addHook.bind(this.#hooks);
  public removeHook = this.#hooks.removeHook.bind(this.#hooks);

  /**
   * Returns RawTxs to update price feeds
   * @param priceFeeds top-level price feeds, actual updatable price feeds will be derived. If not provided will use all price feeds that are attached
   * @returns
   */
  public async generatePriceFeedsUpdateTxs(
    priceFeeds?: IPriceFeedContract[],
  ): Promise<UpdatePriceFeedsResult> {
    const priceFeedz = priceFeeds ?? Object.values(this.#feeds);
    const updateables = priceFeedz.flatMap(pf => pf.updatableDependencies());
    const txs: RawTx[] = [];
    const redstonePFs: RedstonePriceFeedContract[] = [];

    for (const pf of updateables) {
      if (pf instanceof RedstonePriceFeedContract) {
        redstonePFs.push(pf);
      }
    }

    let maxTimestamp = 0;
    if (redstonePFs.length > 0) {
      const redstoneUpdates =
        await this.#redstoneUpdater.getUpdateTxs(redstonePFs);
      for (const { tx, timestamp } of redstoneUpdates) {
        if (timestamp > maxTimestamp) {
          maxTimestamp = timestamp;
        }
        txs.push(tx);
      }
    }

    const result: UpdatePriceFeedsResult = { txs, timestamp: maxTimestamp };
    await this.#hooks.triggerHooks("updatesGenerated", result);
    return result;
  }

  public get(address: Address): IPriceFeedContract | undefined {
    return this.#feeds.get(address);
  }

  public mustGet(address: Address): IPriceFeedContract {
    return this.#feeds.mustGet(address);
  }

  public create(data: PriceFeedTreeNode): IPriceFeedContract {
    const feed = this.#create(data);
    this.#feeds.upsert(data.baseParams.addr, feed);
    return feed;
  }

  /**
   * Set redstone historical timestamp
   * @param timestampMs in milliseconds
   */
  public setRedstoneHistoricalTimestamp(timestampMs: number): void {
    this.#redstoneUpdater.setHistoricalTimestamp(timestampMs);
  }

  #create(data: PriceFeedTreeNode): IPriceFeedContract {
    const contractType = bytes32ToString(
      data.baseParams.contractType as Hex,
    ) as PriceFeedContractType;

    switch (contractType) {
      case "PF_CHAINLINK_ORACLE":
        return new ChainlinkPriceFeedContract(this.sdk, data);

      case "PF_YEARN_ORACLE":
        return new YearnPriceFeedContract(this.sdk, data);

      case "PF_CURVE_STABLE_LP_ORACLE":
        return new CurveStablePriceFeedContract(this.sdk, data);

      case "PF_WSTETH_ORACLE":
        return new WstETHPriceFeedContract(this.sdk, data);

      case "PF_BOUNDED_ORACLE":
        return new BoundedPriceFeedContract(this.sdk, data);

      case "PF_COMPOSITE_ORACLE":
        return new CompositePriceFeedContract(this.sdk, data);

      case "PF_BALANCER_STABLE_LP_ORACLE":
        return new BalancerStablePriceFeedContract(this.sdk, data);

      case "PF_BALANCER_WEIGHTED_LP_ORACLE":
        return new BalancerWeightedPriceFeedContract(this.sdk, data);

      case "PF_CURVE_CRYPTO_LP_ORACLE":
        return new CurveCryptoPriceFeedContract(this.sdk, data);

      case "PF_REDSTONE_ORACLE":
        return new RedstonePriceFeedContract(this.sdk, data);

      case "PF_ERC4626_ORACLE":
        return new Erc4626PriceFeedContract(this.sdk, data);

      case "PF_CURVE_USD_ORACLE":
        return new CurveUSDPriceFeedContract(this.sdk, data);

      case "PF_ZERO_ORACLE":
        return new ZeroPriceFeedContract(this.sdk, data);

      case "PF_MELLOW_LRT_ORACLE":
        return new MellowLRTPriceFeedContract(this.sdk, data);

      default:
        throw new Error(`Price feed type ${contractType} not supported, `);
    }
  }
}

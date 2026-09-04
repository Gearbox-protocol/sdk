import type { Address, ContractEventName, Log } from "viem";
import { iPriceOracleV310Abi } from "../../../abi/310/generated.js";
import type { PriceOracleData } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { simulateWithPriceUpdates } from "../../utils/viem/simulateWithPriceUpdates.js";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract.js";

const abi = iPriceOracleV310Abi;
type abi = typeof abi;

export class PriceOracleV310Contract extends PriceOracleBaseContract<abi> {
  constructor(sdk: OnchainSDK, data: PriceOracleData) {
    super(
      sdk,
      {
        ...data.baseParams,
        name: "PriceOracleV3",
        abi,
      },
      data,
    );
  }

  /**
   * {@inheritDoc IPriceOracleContract.updateAndConvert}
   **/
  public async updateAndConvert(
    from: Address,
    to: Address,
    amount: bigint,
  ): Promise<bigint> {
    const fromFeed = this.mainPriceFeeds.mustGet(from).priceFeed;
    const toFeed = this.mainPriceFeeds.mustGet(to).priceFeed;
    const updates = await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs([
      fromFeed,
      toFeed,
    ]);
    const [result] = await simulateWithPriceUpdates(this.sdk.client, {
      priceUpdates: updates.txs,
      contracts: [
        {
          abi: this.contract.abi,
          functionName: "convert",
          args: [amount, from, to],
          address: this.contract.address,
        },
      ],
      strictPrices: true,
      gas: this.sdk.gasLimit,
    });
    return result;
  }

  public override processLog(
    log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      abi,
      ContractEventName<abi>
    >,
  ): void {
    switch (log.eventName) {
      case "SetPriceFeed":
      case "SetReservePriceFeed":
        this.dirty = true;
        break;
    }
  }
}

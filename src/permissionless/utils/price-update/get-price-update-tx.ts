import {
  type Address,
  type Chain,
  decodeFunctionData,
  type Hex,
  multicall3Abi,
  type PublicClient,
  parseAbi,
  type Transport,
} from "viem";
import type {
  GearboxChain,
  IPriceUpdateTx,
  PriceUpdate,
  RawTx,
} from "../../../sdk/index.js";
import {
  createRawTx,
  GearboxSDK,
  getRawPriceUpdates,
} from "../../../sdk/index.js";
import { PriceFeedStoreContract } from "../../bindings/index.js";
import { Addresses } from "../../deployment/addresses.js";

export async function getPriceUpdateTx({
  client,
  priceFeeds,
  useMulticall3 = false,
  gasLimit,
}: {
  client: PublicClient<Transport, Chain>;
  priceFeeds: Address[];
  useMulticall3?: boolean;
  gasLimit?: bigint;
}): Promise<RawTx | undefined> {
  const pfStore = new PriceFeedStoreContract(
    Addresses.PRICE_FEED_STORE,
    client,
  );

  const sdk = await GearboxSDK.attach({
    client: client as PublicClient<Transport, GearboxChain>,
    marketConfigurators: [],
    gasLimit,
  });

  const updateTxs =
    await sdk.priceFeeds.generateExternalPriceFeedsUpdateTxs(priceFeeds);

  if (useMulticall3) {
    const multicallCalls = updateTxs.txs.map(tx => ({
      target: tx.raw.to as `0x${string}`,
      allowFailure: false,
      callData: tx.raw.callData,
    }));

    if (multicallCalls.length === 0) {
      return undefined;
    }

    const multicall3Address = client.chain?.contracts?.multicall3?.address;
    if (!multicall3Address) {
      throw new Error("Multicall3 address not found");
    }

    const multicallTx = createRawTx(multicall3Address, {
      abi: multicall3Abi,
      functionName: "aggregate3",
      args: [multicallCalls],
    });

    return multicallTx;
  }

  const priceUpdates = getRawPriceUpdates(updateTxs);
  if (priceUpdates.length === 0) {
    return undefined;
  }
  return pfStore.updatePrices(priceUpdates);
}

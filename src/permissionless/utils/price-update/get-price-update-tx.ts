import {
  type Address,
  decodeFunctionData,
  type Hex,
  multicall3Abi,
  type PublicClient,
  parseAbi,
} from "viem";
import {
  GearboxSDK,
  type IPriceUpdateTx,
  type RawTx,
} from "../../../sdk/index.js";
import { createRawTx } from "../../../sdk/utils/index.js";
import {
  PriceFeedStoreContract,
  type PriceUpdate,
} from "../../bindings/index.js";
import { Addresses } from "../../deployment/addresses.js";

export function getUpdateCalldata(tx: IPriceUpdateTx): PriceUpdate {
  const data = decodeFunctionData({
    abi: parseAbi(["function updatePrice(bytes calldata data) external"]),
    data: tx.raw.callData,
  });
  return {
    priceFeed: tx.raw.to,
    data: data.args[0] as Hex,
  };
}

export async function getPriceUpdateTx({
  client,
  priceFeeds,
  useMulticall3 = false,
}: {
  client: PublicClient;
  priceFeeds: Address[];
  useMulticall3?: boolean;
}): Promise<RawTx | undefined> {
  const pfStore = new PriceFeedStoreContract(
    Addresses.PRICE_FEED_STORE,
    client,
  );

  const sdk = await GearboxSDK.attach({
    rpcURLs: [client.transport.url!],
    marketConfigurators: [],
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

  const priceUpdates = updateTxs.txs.map(tx => getUpdateCalldata(tx));
  if (priceUpdates.length === 0) {
    return undefined;
  }
  return pfStore.updatePrices(priceUpdates);
}

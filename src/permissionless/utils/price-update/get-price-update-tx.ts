import {
  type Address,
  type Chain,
  multicall3Abi,
  type PublicClient,
  type Transport,
} from "viem";
import type { GearboxChain, RawTx } from "../../../sdk/index.js";
import {
  createRawTx,
  getRawPriceUpdates,
  OnchainSDK,
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

  const gearboxClient = client as PublicClient<Transport, GearboxChain>;
  const chain = gearboxClient.chain;
  if (!chain) {
    throw new Error("Chain not defined on client");
  }
  const sdk = new OnchainSDK(
    chain.network,
    { client: gearboxClient },
    { gasLimit },
  );
  await sdk.attach({ marketConfigurators: [] });

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

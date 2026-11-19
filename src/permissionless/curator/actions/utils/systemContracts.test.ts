import { describe, expect, it } from "vitest";
import { MarketConfiguratorContract } from "../../../bindings/market-configurator.js";
import { Addresses } from "../../../deployment/addresses.js";
import { MarketExecutor } from "../../executor/MarketExecutor.js";
import {
  CONFIGURATOR,
  createStubClient,
  FEED_WETH,
  marketState,
  SOURCE_TIMESTAMP,
  WETH,
} from "../../testing/sdkHarness.js";

/** An executor on a stub chain, and the reads it makes. **/
function setup() {
  const client = createStubClient({ client: { getCode: async () => "0x60" } });
  const executor = new MarketExecutor(
    {
      client,
      marketConfigurator: new MarketConfiguratorContract(CONFIGURATOR, client),
      tokens: { decimals: () => 6 },
    },
    { timestamp: SOURCE_TIMESTAMP },
  );
  const reads = () =>
    client.calls.flatMap(call =>
      call.kind === "readContract"
        ? [{ functionName: call.functionName, address: call.address }]
        : [],
    );
  return { executor, reads };
}

const LOOKUPS = ["addressProvider", "getAddressOrRevert", "bytecodeRepository"];

describe("system contracts", () => {
  it("checks a price feed against the store without looking it up", async () => {
    const { executor, reads } = setup();
    await executor.execute(marketState(), [
      {
        type: "ORACLE::setReservePriceFeed",
        params: { token: WETH, priceFeed: FEED_WETH },
      },
    ]);
    expect(reads().filter(r => LOOKUPS.includes(r.functionName))).toEqual([]);
    expect(reads()).toContainEqual({
      functionName: "isAllowedPriceFeed",
      address: Addresses.PRICE_FEED_STORE.toLowerCase(),
    });
  });

  it("checks a periphery contract's provenance at the Bytecode Repository", async () => {
    const { executor, reads } = setup();
    await executor.execute(marketState(), [
      {
        type: "MARKET::addPeripheryContract",
        params: { peripheryContract: FEED_WETH, domain: "ZAPPER", type: "" },
      },
    ]);
    expect(reads().filter(r => LOOKUPS.includes(r.functionName))).toEqual([]);
    expect(reads()).toContainEqual({
      functionName: "isDeployedFromRepository",
      address: Addresses.BYTECODE_REPOSITORY.toLowerCase(),
    });
  });

  it("deploys a loss policy with the address provider, reading nothing", async () => {
    const { executor, reads } = setup();
    const result = await executor.executeBatch(marketState(), [
      { type: "MARKET::updateLossPolicy", params: { type: "ALIAS" } },
    ]);
    expect(reads()).toEqual([]);
    expect(result.txs[0].tx.callData.toLowerCase()).toContain(
      Addresses.ADDRESS_PROVIDER.slice(2).toLowerCase(),
    );
  });
});

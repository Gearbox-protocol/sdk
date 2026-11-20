import { stringToHex, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { AliasLossPolicyV310Contract } from "../../../../../onchain/market/loss-policy/AliasLossPolicyV310Contract.js";
import type { MarketSuite } from "../../../../../onchain/market/MarketSuite.js";
import { MarketConfiguratorContract } from "../../../../bindings/market-configurator.js";
import { AccessMode } from "../../../../bindings/types.js";
import { MarketExecutor } from "../../../executor/MarketExecutor.js";
import { buildLossPolicyState } from "../../../state/market/buildLossPolicyState.js";
import {
  CONFIGURATOR,
  createStubClient,
  FEED_WETH,
  marketState,
  SOURCE_TIMESTAMP,
  WETH,
} from "../../../testing/sdkHarness.js";
import { midasAliasPlugin } from "./midasAliasPlugin.js";

function executor() {
  const client = createStubClient();
  return new MarketExecutor(
    {
      client,
      marketConfigurator: new MarketConfiguratorContract(CONFIGURATOR, client),
      tokens: { decimals: () => 6 },
    },
    { timestamp: SOURCE_TIMESTAMP },
  );
}

describe("Midas aliased loss policy", () => {
  it("is deployed as LOSS_POLICY::MIDAS_ALIASED", async () => {
    const result = await executor().executeBatch(marketState(), [
      { type: "MARKET::updateLossPolicy", params: { type: "MIDAS_ALIAS" } },
    ]);
    expect(result.after.lossPolicy).toEqual({
      type: "MIDAS_ALIAS",
      aliases: {},
      mode: AccessMode.Permissionless,
      enabled: true,
    });
    const [tx] = result.txs;
    expect(tx.tx.callData.toLowerCase()).toContain(
      stringToHex("MIDAS_ALIASED", { size: 32 }).slice(2),
    );
    expect(tx.estimatedGas).toBe(midasAliasPlugin.deployGas);
  });

  it("takes the alias actions, and keeps its type", async () => {
    const state = marketState();
    state.lossPolicy = {
      type: "MIDAS_ALIAS",
      aliases: { [WETH]: FEED_WETH },
      enabled: true,
      mode: AccessMode.Permissionless,
    };
    const result = await executor().executeBatch(state, [
      {
        type: "LOSS_POLICY::ALIAS::setAlias",
        params: { token: WETH, alias: zeroAddress },
      },
      {
        type: "LOSS_POLICY::ALIAS::setAccessMode",
        params: { mode: AccessMode.Permissioned },
      },
    ]);
    expect(result.after.lossPolicy).toMatchObject({
      type: "MIDAS_ALIAS",
      aliases: {},
      mode: AccessMode.Permissioned,
    });
  });

  it("refuses the alias actions on a policy the SDK does not decode", async () => {
    const state = marketState();
    state.lossPolicy = {} as typeof state.lossPolicy;
    const run = await executor().execute(state, [
      {
        type: "LOSS_POLICY::ALIAS::setChecksEnabled",
        params: { enabled: false },
      },
    ]);
    expect(run.diagnostics).toMatchObject([
      { code: "LOSS_POLICY_MISMATCH", actionIndex: 0 },
    ]);
  });

  it("is read back from its contract type", () => {
    const policy = Object.assign(
      Object.create(AliasLossPolicyV310Contract.prototype),
      {
        contractType: "LOSS_POLICY::MIDAS_ALIASED",
        accessMode: AccessMode.Permissioned,
        checksEnabled: true,
        tokens: [WETH],
        priceFeedParams: [{ priceFeed: FEED_WETH }],
      },
    );
    const state = buildLossPolicyState({
      lossPolicy: policy,
    } as unknown as MarketSuite);
    expect(state).toEqual({
      type: "MIDAS_ALIAS",
      aliases: { [WETH]: FEED_WETH },
      mode: AccessMode.Permissioned,
      enabled: true,
    });
  });
});

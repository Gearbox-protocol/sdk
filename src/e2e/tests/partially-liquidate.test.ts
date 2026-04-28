import {
  type Address,
  createTestClient,
  erc20Abi,
  http,
  parseEventLogs,
  publicActions,
  walletActions,
} from "viem";
import { dealActions } from "viem-deal";
import { beforeAll, describe, expect, it } from "vitest";
import { iCreditFacadeV310Abi } from "../../abi/310/generated.js";
import { calcLiquidatableLTs } from "../../dev/calcLiquidatableLTs.js";
import type { AnvilClient } from "../../dev/createAnvilClient.js";
import { setLTs } from "../../dev/ltUtils.js";
import {
  MAX_UINT256,
  OnchainSDK,
  sendRawTx,
  TypedObjectUtils,
  WAD,
} from "../../sdk/index.js";
import { ANVIL_URL } from "../constants.js";
import {
  getAnvilWallet,
  PYTH_API_PROXY,
  REDSTONE_GATEWAYS,
  useFixture,
} from "../helpers.js";

const BLOCK = 24_728_000n;
const CREDIT_ACCOUNT: Address = "0xafaf7CfB3E97621bf7eb5b0154E6F623C3034D94";

describe("partially liquidate credit account", () => {
  let sdk: OnchainSDK;

  useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(async () => {
    sdk = new OnchainSDK("Mainnet", {
      rpcURLs: [ANVIL_URL],
      timeout: 120_000,
    });
    await sdk.attach({
      blockNumber: BLOCK,
      ignoreUpdateablePrices: false,
      redstone: {
        historicTimestamp: true,
        gateways: REDSTONE_GATEWAYS,
      },
      pyth: {
        historicTimestamp: true,
        apiProxy: PYTH_API_PROXY,
      },
    });
  });

  it("should partially liquidate a credit account", async () => {
    const wallet = getAnvilWallet(sdk);
    const liquidator = wallet.account.address;
    const anvil = createTestClient({
      mode: "anvil",
      chain: sdk.chain,
      transport: http(ANVIL_URL, { timeout: 120_000 }),
      pollingInterval: 100,
    })
      .extend(publicActions)
      .extend(walletActions)
      .extend(dealActions);

    const ca = await sdk.accounts.getCreditAccountData(CREDIT_ACCOUNT);
    if (!ca) {
      throw new Error(`credit account ${CREDIT_ACCOUNT} not found`);
    }
    const cm = sdk.marketRegister.findCreditManager(ca.creditManager);

    // Drop LTs of all collateral on the account so HF goes just below 1.
    const newLTs = await calcLiquidatableLTs(sdk, ca);
    await setLTs(anvil as unknown as AnvilClient, cm.state, newLTs);
    for (const [token, lt] of TypedObjectUtils.entries(newLTs)) {
      cm.creditManager.liquidationThresholds.upsert(token, lt);
    }

    const lowered = await sdk.accounts.getCreditAccountData(CREDIT_ACCOUNT);
    if (!lowered) {
      throw new Error(
        `credit account ${CREDIT_ACCOUNT} not found after setLTs`,
      );
    }
    expect(lowered.healthFactor).toBeLessThan(WAD);

    // Fund liquidator with underlying and approve credit manager to pull repay.
    await anvil.deal({
      erc20: cm.underlying,
      account: liquidator,
      amount: MAX_UINT256 / 2n,
    });
    const approveHash = await wallet.writeContract({
      address: cm.underlying,
      abi: erc20Abi,
      functionName: "approve",
      args: [cm.creditManager.address, MAX_UINT256],
    });
    await sdk.client.waitForTransactionReceipt({
      hash: approveHash,
      pollingInterval: 100,
    });

    const tx = await sdk.accounts.partiallyLiquidate({
      account: lowered,
      to: liquidator,
    });
    const hash = await sendRawTx(wallet, { tx, gas: 5_000_000n });
    const receipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    expect(receipt.status).toBe("success");

    const logs = parseEventLogs({
      abi: iCreditFacadeV310Abi,
      logs: receipt.logs,
      eventName: "PartiallyLiquidateCreditAccount",
    });
    expect(logs).toMatchObject([
      {
        args: {
          creditAccount: CREDIT_ACCOUNT,
          liquidator,
        },
      },
    ]);

    const after = await sdk.accounts.getCreditAccountData(CREDIT_ACCOUNT);
    if (!after) {
      throw new Error(
        `credit account ${CREDIT_ACCOUNT} not found after liquidation`,
      );
    }
    expect(after.healthFactor).toBeGreaterThan(WAD);
  });
});

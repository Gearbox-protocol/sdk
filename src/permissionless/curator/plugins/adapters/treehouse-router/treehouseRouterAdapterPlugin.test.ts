import { type Address, encodeFunctionData, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { iTreehouseRouterAdapterAbi } from "../../../../../onchain/index.js";
import type { AllowAdapterAction } from "../../../actions/allowAdapterActionData.js";
import {
  CM,
  createTestSdk,
  marketState,
  SOURCE_TIMESTAMP,
  USDC,
  WETH,
} from "../../../testing/sdkHarness.js";
import type { SetAssetStatusBatchAction } from "./setAssetStatusBatchActionData.js";

const ROUTER: Address = "0x7777777777777777777777777777777777770001";
const AUTHOR: Address = "0x000000000000000000000000000000000000dEaD";

const allowRouter: AllowAdapterAction = {
  type: "CREDIT::allowAdapter",
  params: {
    creditManager: CM,
    adapter: { type: "TREEHOUSE_ROUTER", version: 310, target: ROUTER },
  },
};

const setAssets = (
  allowedAssets: { asset: Address; allowed: boolean }[],
): SetAssetStatusBatchAction => ({
  type: "ADAPTER::TREEHOUSE_ROUTER::setAssetStatusBatch",
  params: { creditManager: CM, version: 310, target: ROUTER, allowedAssets },
});

/** A chain on which the router deposits into WETH, the credit manager's collateral. **/
const routerChain = {
  stub: {
    readContract: (args: { functionName: string }) =>
      args.functionName === "TASSET" ? WETH : undefined,
  },
};

describe("Treehouse router adapter", () => {
  it("allows the router, merges its asset batches and encodes them", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null, ...routerChain });
    const builder = sdk
      .market({ initialState: marketState() })
      .addAction(allowRouter)
      .addAction(setAssets([{ asset: USDC, allowed: true }]))
      .addAction(setAssets([{ asset: WETH, allowed: true }]));

    const preview = await builder.preview();
    expect(preview.actionDiagnostics).toEqual([]);
    expect(preview.after.creditManagers[CM].adapters[ROUTER]).toEqual({
      type: "TREEHOUSE_ROUTER",
      version: 310,
      target: ROUTER,
      adapter: zeroAddress,
      isForbidden: false,
      allowedAssets: [
        { asset: USDC, allowed: true },
        { asset: WETH, allowed: true },
      ],
    });

    const plan = await builder.build({
      author: AUTHOR,
      eta: SOURCE_TIMESTAMP + 7 * 24 * 60 * 60,
    });
    const configure = plan.payloadCalls[1].callData.toLowerCase();
    const inner = encodeFunctionData({
      abi: iTreehouseRouterAdapterAbi,
      functionName: "setAssetStatusBatch",
      args: [
        [USDC, WETH],
        [true, true],
      ],
    });
    expect(configure).toContain(inner.slice(2).toLowerCase());
  });
});

import type { Address, Hex } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import { AdaptersPlugin } from "../../plugins/adapters/index.js";
import { BotsPlugin } from "../../plugins/bots/index.js";
import { type ClientOptions, OnchainSDK } from "../../sdk/index.js";
import { previewOperation } from "./previewOperation.js";
import type {
  AdjustCreditAccountPreview,
  CloseCreditAccountPreview,
  DelayedCreditAccountOperationPreview,
  InstantOperationPreview,
  OperationPreview,
  RepayCreditAccountPreview,
} from "./types.js";

const to: Address = "0x0000000000000000000000000000000000000001";
const sender: Address = "0x0000000000000000000000000000000000000002";
const calldata: Hex = "0x";

const clientOptions: ClientOptions = {
  rpcURLs: ["http://127.0.0.1:8545"],
};

const sdkWithAdapters = new OnchainSDK("Mainnet", clientOptions, {
  plugins: { adapters: new AdaptersPlugin() },
});

const sdkWithAdaptersUnderOtherKey = new OnchainSDK("Mainnet", clientOptions, {
  plugins: { whatever: new AdaptersPlugin() },
});

const sdkWithoutPlugins = new OnchainSDK("Mainnet", clientOptions);

const sdkWithUnrelatedPlugin = new OnchainSDK("Mainnet", clientOptions, {
  plugins: { bots: new BotsPlugin() },
});

describe("previewOperation sdk typing", () => {
  it("accepts an SDK created with the adapters plugin", () => {
    void previewOperation({ sdk: sdkWithAdapters, to, calldata, sender });
  });

  it("accepts the adapters plugin under any key", () => {
    void previewOperation({
      sdk: sdkWithAdaptersUnderOtherKey,
      to,
      calldata,
      sender,
    });
  });

  it("rejects an SDK created without plugins", () => {
    // @ts-expect-error OnchainSDK must be created with the AdaptersPlugin
    void previewOperation({ sdk: sdkWithoutPlugins, to, calldata, sender });
  });

  it("rejects an SDK with only unrelated plugins", () => {
    void previewOperation({
      // @ts-expect-error OnchainSDK must be created with the AdaptersPlugin
      sdk: sdkWithUnrelatedPlugin,
      to,
      calldata,
      sender,
    });
  });
});

describe("OperationPreview union", () => {
  it("includes DelayedCreditAccountOperationPreview", () => {
    expectTypeOf<DelayedCreditAccountOperationPreview>().toExtend<OperationPreview>();
  });

  it("InstantOperationPreview covers exactly the adjust/close/repay previews", () => {
    expectTypeOf<InstantOperationPreview>().toEqualTypeOf<
      | AdjustCreditAccountPreview
      | CloseCreditAccountPreview
      | RepayCreditAccountPreview
    >();
    expectTypeOf<InstantOperationPreview>().toExtend<OperationPreview>();
  });

  it("delayed wrapper nests instant previews, not other wrappers", () => {
    expectTypeOf<
      DelayedCreditAccountOperationPreview["instantPreview"]
    >().toEqualTypeOf<InstantOperationPreview>();
    expectTypeOf<
      DelayedCreditAccountOperationPreview["delayedPreview"]
    >().toEqualTypeOf<InstantOperationPreview>();
    expectTypeOf<DelayedCreditAccountOperationPreview>().not.toExtend<
      DelayedCreditAccountOperationPreview["instantPreview"]
    >();
  });
});

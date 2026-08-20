import type { Address, Hex } from "viem";
import { describe, it } from "vitest";
import { BotsPlugin } from "../../plugins/bots/index.js";
import { type ClientOptions, OnchainSDK } from "../../sdk/index.js";
import { previewOperation } from "./previewOperation.js";

const to: Address = "0x0000000000000000000000000000000000000001";
const sender: Address = "0x0000000000000000000000000000000000000002";
const calldata: Hex = "0x";

const clientOptions: ClientOptions = {
  rpcURLs: ["http://127.0.0.1:8545"],
};

const sdkWithoutPlugins = new OnchainSDK("Mainnet", clientOptions);

const sdkWithUnrelatedPlugin = new OnchainSDK("Mainnet", clientOptions, {
  plugins: { bots: new BotsPlugin() },
});

describe("previewOperation sdk typing", () => {
  it("accepts an SDK created without plugins", () => {
    void previewOperation({ sdk: sdkWithoutPlugins, to, calldata, sender });
  });

  it("accepts an SDK with unrelated plugins", () => {
    void previewOperation({
      sdk: sdkWithUnrelatedPlugin,
      to,
      calldata,
      sender,
    });
  });
});

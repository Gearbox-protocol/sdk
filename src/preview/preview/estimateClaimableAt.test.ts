import { getAddress } from "viem";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { OnchainSDK, WithdrawableAsset } from "../../onchain/index.js";
import { estimateClaimableAt } from "./estimateClaimableAt.js";

const PHANTOM = getAddress("0xe4a38b653B2580C9D72a50F190Ddd6E2d2D2a412");
const OTHER = getAddress("0x04E30f28e1769E971BE6dC8d53E812126665eaBB");
const SOURCE = getAddress("0x17418038ecF73BA4026c4f428547BF099706F27B");
const UNDERLYING = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const CM = getAddress("0x1111111111111111111111111111111111111111");

const NOW_MS = 1_700_000_000_000;
const WITHDRAWAL_LENGTH = 90n * 24n * 60n * 60n;

const ASSET: WithdrawableAsset = {
  creditManager: CM,
  token: SOURCE,
  withdrawalPhantomToken: PHANTOM,
  underlying: UNDERLYING,
  withdrawalLength: WITHDRAWAL_LENGTH,
};

interface StubCompressor {
  state?: object;
  assets?: WithdrawableAsset[];
}

function stubSdk(compressor?: StubCompressor): OnchainSDK {
  if (!compressor) {
    return { withdrawalCompressor: undefined } as unknown as OnchainSDK;
  }
  return {
    withdrawalCompressor: {
      state: compressor.state,
      getWithdrawableAssets: () => compressor.assets ?? [],
    },
  } as unknown as OnchainSDK;
}

describe("estimateClaimableAt", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns undefined when the withdrawal compressor is missing", () => {
    expect(estimateClaimableAt(stubSdk(), PHANTOM)).toBeUndefined();
  });

  it("returns undefined when the assets cache is not loaded", () => {
    expect(
      estimateClaimableAt(stubSdk({ assets: [ASSET] }), PHANTOM),
    ).toBeUndefined();
  });

  it("returns undefined when no asset matches the phantom token", () => {
    expect(
      estimateClaimableAt(stubSdk({ state: {}, assets: [ASSET] }), OTHER),
    ).toBeUndefined();
  });

  it("returns now + withdrawalLength of the matching asset", () => {
    vi.spyOn(Date, "now").mockReturnValue(NOW_MS);

    expect(
      estimateClaimableAt(stubSdk({ state: {}, assets: [ASSET] }), PHANTOM),
    ).toBe(NOW_MS / 1000 + Number(WITHDRAWAL_LENGTH));
  });
});

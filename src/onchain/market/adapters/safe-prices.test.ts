import {
  type Abi,
  type Address,
  encodeFunctionData,
  type Hex,
  zeroAddress,
} from "viem";
import { describe, expect, it } from "vitest";
import { ierc4626AdapterAbi } from "../../../abi/ierc4626Adapter.js";
import { iBalancerV3RouterAdapterAbi } from "./abi/adapters/iBalancerV3RouterAdapter.js";
import { iKelpLrtDepositPoolAdapterAbi } from "./abi/adapters/iKelpLrtDepositPool.js";
import { iSecuritizeRedemptionGatewayAdapterV311Abi } from "./abi/adapters/iSecuritizeRedemptionGatewayAdapterV311.js";
import { iUniswapV3AdapterAbi } from "./abi/adapters/iUniswapV3Adapter.js";
import { iwstEthv1AdapterAbi } from "./abi/adapters/iwstEthv1Adapter.js";
import { classifyAdapterSafePrices } from "./safe-prices.js";
import type { IAdapterContract } from "./types.js";

const TOKEN = "0x1111111111111111111111111111111111111111" as Address;
function adapter(
  contractType: string,
  version: number,
  abi: Abi,
  metadata = {},
): IAdapterContract {
  return {
    contractType,
    version,
    abi,
    ...metadata,
  } as unknown as IAdapterContract;
}
const uni = adapter("ADAPTER::UNISWAP_V3_ROUTER", 310, iUniswapV3AdapterAbi);
const diff = encodeFunctionData({
  abi: iUniswapV3AdapterAbi,
  functionName: "exactDiffInputSingle",
  args: [
    {
      tokenIn: TOKEN,
      tokenOut: zeroAddress,
      fee: 3000,
      deadline: 100n,
      leftoverAmount: 5n,
      rateMinRAY: 1n,
      sqrtPriceLimitX96: 0n,
    },
  ],
});
const bounds = (min: bigint, max = min) => ({
  balanceOf: (token: Address) => (token === TOKEN ? { min, max } : undefined),
});

describe("classifyAdapterSafePrices", () => {
  it("decodes real exact calldata and does not infer the flag from a bool output name", () => {
    const exact = encodeFunctionData({
      abi: iUniswapV3AdapterAbi,
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn: TOKEN,
          tokenOut: zeroAddress,
          fee: 3000,
          recipient: zeroAddress,
          deadline: 100n,
          amountIn: 10n,
          amountOutMinimum: 1n,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });
    expect(classifyAdapterSafePrices(uni, exact)).toEqual({
      kind: "known",
      useSafePrices: true,
    });
    const wrap = encodeFunctionData({
      abi: iwstEthv1AdapterAbi,
      functionName: "wrap",
      args: [10n],
    });
    expect(
      classifyAdapterSafePrices(
        adapter("ADAPTER::LIDO_WSTETH_V1", 310, iwstEthv1AdapterAbi),
        wrap,
      ),
    ).toEqual({ kind: "known", useSafePrices: false });
  });

  it("resolves diff execution/no-op from guaranteed pre-call bounds, including equality", () => {
    expect(classifyAdapterSafePrices(uni, diff, bounds(6n, 20n))).toEqual({
      kind: "known",
      useSafePrices: true,
    });
    expect(classifyAdapterSafePrices(uni, diff, bounds(0n, 5n))).toEqual({
      kind: "known",
      useSafePrices: false,
    });
    expect(classifyAdapterSafePrices(uni, diff, bounds(5n))).toEqual({
      kind: "known",
      useSafePrices: false,
    });
    expect(classifyAdapterSafePrices(uni, diff, bounds(4n, 6n)).kind).toBe(
      "state-dependent",
    );
    expect(classifyAdapterSafePrices(uni, diff).kind).toBe("state-dependent");
    expect(classifyAdapterSafePrices(uni, diff, bounds(6n, 4n)).kind).toBe(
      "state-dependent",
    );
  });

  it("preserves Kelp's strict less-than guard, whose equality branch executes", () => {
    const kelp = adapter(
      "ADAPTER::KELP_DEPOSIT_POOL",
      310,
      iKelpLrtDepositPoolAdapterAbi,
    );
    const data = encodeFunctionData({
      abi: iKelpLrtDepositPoolAdapterAbi,
      functionName: "depositAssetDiff",
      args: [TOKEN, 5n, 1n],
    });
    expect(classifyAdapterSafePrices(kelp, data, bounds(4n))).toEqual({
      kind: "known",
      useSafePrices: false,
    });
    expect(classifyAdapterSafePrices(kelp, data, bounds(5n))).toEqual({
      kind: "known",
      useSafePrices: true,
    });
  });

  it("distinguishes ordinary ERC4626 false from Mellow's overridden delayed withdrawal", () => {
    const data = encodeFunctionData({
      abi: ierc4626AdapterAbi,
      functionName: "redeemDiff",
      args: [5n],
    });
    expect(
      classifyAdapterSafePrices(
        adapter("ADAPTER::ERC4626_VAULT", 312, ierc4626AdapterAbi),
        data,
      ),
    ).toEqual({ kind: "known", useSafePrices: false });
    const mellow = adapter(
      "ADAPTER::MELLOW_ERC4626_VAULT",
      312,
      ierc4626AdapterAbi,
      { vault: TOKEN },
    );
    expect(classifyAdapterSafePrices(mellow, data, bounds(6n))).toEqual({
      kind: "known",
      useSafePrices: true,
    });
    expect(classifyAdapterSafePrices(mellow, data, bounds(5n))).toEqual({
      kind: "known",
      useSafePrices: false,
    });
    expect(
      classifyAdapterSafePrices(
        adapter("ADAPTER::MELLOW_ERC4626_VAULT", 311, ierc4626AdapterAbi),
        data,
      ).kind,
    ).toBe("unsupported");
  });

  it("does not impose a no-op false rule on Balancer's unconditional diff return", () => {
    const data = encodeFunctionData({
      abi: iBalancerV3RouterAdapterAbi,
      functionName: "swapSingleTokenDiffIn",
      args: [TOKEN, TOKEN, zeroAddress, 5n, 1n, 100n],
    });
    expect(
      classifyAdapterSafePrices(
        adapter(
          "ADAPTER::BALANCER_V3_ROUTER",
          311,
          iBalancerV3RouterAdapterAbi,
        ),
        data,
        bounds(0n),
      ),
    ).toEqual({ kind: "known", useSafePrices: true });
  });

  it("uses the actual version for Securitize claims", () => {
    const data = encodeFunctionData({
      abi: iSecuritizeRedemptionGatewayAdapterV311Abi,
      functionName: "claim",
      args: [[TOKEN]],
    });
    expect(
      classifyAdapterSafePrices(
        adapter(
          "ADAPTER::SECURITIZE_REDEMPTION",
          310,
          iSecuritizeRedemptionGatewayAdapterV311Abi,
        ),
        data,
      ),
    ).toEqual({ kind: "known", useSafePrices: false });
    expect(
      classifyAdapterSafePrices(
        adapter(
          "ADAPTER::SECURITIZE_REDEMPTION",
          311,
          iSecuritizeRedemptionGatewayAdapterV311Abi,
        ),
        data,
      ),
    ).toEqual({ kind: "known", useSafePrices: true });
  });

  it("does not accept a newer overload just because the shared SDK ABI decodes it", () => {
    const data = encodeFunctionData({
      abi: iSecuritizeRedemptionGatewayAdapterV311Abi,
      functionName: "redeem",
      args: [10n, "0x1234"],
    });
    expect(
      classifyAdapterSafePrices(
        adapter(
          "ADAPTER::SECURITIZE_REDEMPTION",
          310,
          iSecuritizeRedemptionGatewayAdapterV311Abi,
        ),
        data,
      ).kind,
    ).toBe("unsupported");
    expect(
      classifyAdapterSafePrices(
        adapter(
          "ADAPTER::SECURITIZE_REDEMPTION",
          311,
          iSecuritizeRedemptionGatewayAdapterV311Abi,
        ),
        data,
      ),
    ).toEqual({ kind: "known", useSafePrices: true });
  });

  it("never silently classifies malformed calldata, getter selectors, or unknown versions false", () => {
    for (const data of ["0x", "0xdeadbeef", diff.slice(0, 74)] as Hex[])
      expect(classifyAdapterSafePrices(uni, data).kind).toBe("unsupported");
    const getter = encodeFunctionData({
      abi: iUniswapV3AdapterAbi,
      functionName: "contractType",
    });
    expect(classifyAdapterSafePrices(uni, getter).kind).toBe("unsupported");
    expect(
      classifyAdapterSafePrices(
        adapter(uni.contractType, 999, iUniswapV3AdapterAbi),
        diff,
      ).kind,
    ).toBe("unsupported");
    expect(
      classifyAdapterSafePrices(
        adapter("ADAPTER::UNKNOWN", 310, iUniswapV3AdapterAbi),
        diff,
      ).kind,
    ).toBe("unsupported");
  });
});

import type { Address } from "viem";
import { createPublicClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";
import type { ParsedCallV2 } from "../../sdk/base/types.js";
import { toNetTransfers } from "./transferHelpers.js";
import type { TokenTransfer } from "./transfers.js";

const client = createPublicClient({
  chain: mainnet,
  transport: custom({
    request: async () => {
      throw new Error("not implemented");
    },
  }),
});
const options = { client };

const ADDR = "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa" as Address;
const CA = "0xBBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" as Address;
const DEX = "0xCCcCCCcCcCcCccCcCcCccCCcCCcCCCcCcCccCCCc" as Address;
const TOKEN_A = "0x000000000000000000000000000000000000000A" as Address;
const TOKEN_B = "0x000000000000000000000000000000000000000B" as Address;
const TOKEN_C = "0x000000000000000000000000000000000000000C" as Address;
const LP_TOKEN = "0x00000000000000000000000000000000000000Cc" as Address;

function makeParsed(
  functionName: string,
  rawArgs: Record<string, unknown> = {},
): ParsedCallV2 {
  return {
    chainId: 1,
    target: ADDR,
    contractType: "TEST",
    version: 310,
    functionName,
    calldata: "0x",
    rawArgs,
  };
}

/** Net signed balance changes for the credit account from raw transfers. */
function net(transfers: TokenTransfer[]) {
  return toNetTransfers(transfers, CA);
}

const baseParams = {
  addr: ADDR,
  version: 310n,
  contractType: "0x" as `0x${string}`,
};

const swapTransfers: TokenTransfer[] = [
  { token: TOKEN_A, amount: 100n, from: CA, to: DEX },
  { token: TOKEN_B, amount: 200n, from: DEX, to: CA },
];

describe("AbstractAdapterContract default", () => {
  it("returns Swap from transfers", async () => {
    const { AbstractAdapterContract } = await import(
      "./contracts/AbstractAdapter.js"
    );
    const adapter = new AbstractAdapterContract(options, {
      baseParams,
      abi: [],
      protocolAbi: [],
    });
    const result = adapter.classifyLegacyOperation(
      makeParsed("anything"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("Swap");
    expect(result).toHaveProperty("from", TOKEN_A);
    expect(result).toHaveProperty("to", TOKEN_B);
  });
});

describe("Curve adapters", () => {
  it("classifies exchange as CurveExchange", async () => {
    const { Curve2AssetsAdapterContract } = await import(
      "./contracts/Curve2AssetsAdapterContract.js"
    );
    const adapter = new Curve2AssetsAdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("exchange"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("CurveExchange");
  });

  it("classifies add_liquidity as CurveAddLiquidity", async () => {
    const { Curve3AssetsAdapterContract } = await import(
      "./contracts/Curve3AssetsAdapterContract.js"
    );
    const adapter = new Curve3AssetsAdapterContract(options, { baseParams });
    const transfers: TokenTransfer[] = [
      { token: TOKEN_A, amount: 100n, from: CA, to: DEX },
      { token: TOKEN_B, amount: 200n, from: CA, to: DEX },
      {
        token: LP_TOKEN,
        amount: 500n,
        from: DEX,
        to: CA,
      },
    ];
    const result = adapter.classifyLegacyOperation(
      makeParsed("add_liquidity"),
      net(transfers),
    );
    expect(result.operation).toBe("CurveAddLiquidity");
    if (result.operation === "CurveAddLiquidity") {
      expect(result.lpToken).toBe(LP_TOKEN);
      expect(result.addedLiquidity).toHaveLength(2);
    }
  });

  it("classifies remove_liquidity_one_coin as CurveRemoveLiquidityOneCoin", async () => {
    const { Curve4AssetsAdapterContract } = await import(
      "./contracts/Curve4AssetsAdapterContract.js"
    );
    const adapter = new Curve4AssetsAdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("remove_liquidity_one_coin"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("CurveRemoveLiquidityOneCoin");
  });

  it("classifies remove_liquidity as CurveRemoveLiquidity", async () => {
    const { CurveV1StableNGAdapterContract } = await import(
      "./contracts/CurveV1StableNGAdapterContract.js"
    );
    const adapter = new CurveV1StableNGAdapterContract(options, {
      baseParams,
    });
    const transfers: TokenTransfer[] = [
      {
        token: LP_TOKEN,
        amount: 500n,
        from: CA,
        to: DEX,
      },
      { token: TOKEN_A, amount: 100n, from: DEX, to: CA },
      { token: TOKEN_B, amount: 200n, from: DEX, to: CA },
    ];
    const result = adapter.classifyLegacyOperation(
      makeParsed("remove_liquidity"),
      net(transfers),
    );
    expect(result.operation).toBe("CurveRemoveLiquidity");
  });

  it("falls back to Swap for unknown Curve function", async () => {
    const { CurveV1AdapterStETHContract } = await import(
      "./contracts/CurveV1AdapterStETHContract.js"
    );
    const adapter = new CurveV1AdapterStETHContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("unknown_fn"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("Swap");
  });
});

describe("Convex adapters", () => {
  it("ConvexV1Booster: deposit with stake returns ConvexDepositAndStake", async () => {
    const { ConvexV1BoosterAdapterContract } = await import(
      "./contracts/ConvexV1BoosterAdapterContract.js"
    );
    const adapter = new ConvexV1BoosterAdapterContract(options, {
      baseParams,
    });
    const result = adapter.classifyLegacyOperation(
      makeParsed("deposit", { _stake: true }),
      net(swapTransfers),
    );
    expect(result.operation).toBe("ConvexDepositAndStake");
    if (result.operation === "ConvexDepositAndStake") {
      expect(result.depositToken).toBe(TOKEN_A);
    }
  });

  it("ConvexV1Booster: deposit without stake returns ConvexDeposit", async () => {
    const { ConvexV1BoosterAdapterContract } = await import(
      "./contracts/ConvexV1BoosterAdapterContract.js"
    );
    const adapter = new ConvexV1BoosterAdapterContract(options, {
      baseParams,
    });
    const result = adapter.classifyLegacyOperation(
      makeParsed("deposit", { _stake: false }),
      net(swapTransfers),
    );
    expect(result.operation).toBe("ConvexDeposit");
  });

  it("ConvexV1Booster: withdrawAll returns CurveWithdrawal", async () => {
    const { ConvexV1BoosterAdapterContract } = await import(
      "./contracts/ConvexV1BoosterAdapterContract.js"
    );
    const adapter = new ConvexV1BoosterAdapterContract(options, {
      baseParams,
    });
    const result = adapter.classifyLegacyOperation(
      makeParsed("withdrawAll"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("CurveWithdrawal");
  });

  it("ConvexV1BaseRewardPool: getReward returns GetReward", async () => {
    const { ConvexV1BaseRewardPoolAdapterContract } = await import(
      "./contracts/ConvexV1BaseRewardPoolAdapterContract.js"
    );
    const adapter = new ConvexV1BaseRewardPoolAdapterContract(options, {
      baseParams,
    });
    const transfers: TokenTransfer[] = [
      { token: TOKEN_A, amount: 100n, from: DEX, to: CA },
      { token: TOKEN_B, amount: 200n, from: DEX, to: CA },
    ];
    const result = adapter.classifyLegacyOperation(
      makeParsed("getReward"),
      net(transfers),
    );
    expect(result.operation).toBe("GetReward");
    if (result.operation === "GetReward") {
      expect(result.rewards).toHaveLength(2);
    }
  });

  it("ConvexV1BaseRewardPool: stake returns ConvexStake", async () => {
    const { ConvexV1BaseRewardPoolAdapterContract } = await import(
      "./contracts/ConvexV1BaseRewardPoolAdapterContract.js"
    );
    const adapter = new ConvexV1BaseRewardPoolAdapterContract(options, {
      baseParams,
    });
    const transfers: TokenTransfer[] = [
      { token: TOKEN_A, amount: 100n, from: CA, to: DEX },
    ];
    const result = adapter.classifyLegacyOperation(
      makeParsed("stake"),
      net(transfers),
    );
    expect(result.operation).toBe("ConvexStake");
  });

  it("ConvexV1BaseRewardPool: withdrawAndUnwrap with claim returns ConvexWithdrawAndClaim", async () => {
    const { ConvexV1BaseRewardPoolAdapterContract } = await import(
      "./contracts/ConvexV1BaseRewardPoolAdapterContract.js"
    );
    const adapter = new ConvexV1BaseRewardPoolAdapterContract(options, {
      baseParams,
    });
    const transfers: TokenTransfer[] = [
      { token: TOKEN_A, amount: 100n, from: CA, to: DEX },
      { token: TOKEN_B, amount: 200n, from: DEX, to: CA },
      { token: TOKEN_C, amount: 50n, from: DEX, to: CA },
    ];
    const result = adapter.classifyLegacyOperation(
      makeParsed("withdrawAndUnwrap", { claim: true }),
      net(transfers),
    );
    expect(result.operation).toBe("ConvexWithdrawAndClaim");
  });

  it("ConvexV1BaseRewardPool: withdrawAndUnwrap without claim returns ConvexWithdraw", async () => {
    const { ConvexV1BaseRewardPoolAdapterContract } = await import(
      "./contracts/ConvexV1BaseRewardPoolAdapterContract.js"
    );
    const adapter = new ConvexV1BaseRewardPoolAdapterContract(options, {
      baseParams,
    });
    const result = adapter.classifyLegacyOperation(
      makeParsed("withdrawAndUnwrap", { claim: false }),
      net(swapTransfers),
    );
    expect(result.operation).toBe("ConvexWithdraw");
    if (result.operation === "ConvexWithdraw") {
      expect(result.withdrawToken).toBe(TOKEN_B);
    }
  });
});

describe("Uniswap adapters", () => {
  it("UniswapV2 returns UniswapSwap", async () => {
    const { UniswapV2AdapterContract } = await import(
      "./contracts/UniswapV2AdapterContract.js"
    );
    const adapter = new UniswapV2AdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("swapExactTokensForTokens"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("UniswapSwap");
  });

  it("UniswapV3 returns Swap", async () => {
    const { UniswapV3AdapterContract } = await import(
      "./contracts/UniswapV3AdapterContract.js"
    );
    const adapter = new UniswapV3AdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("exactInputSingle"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("Swap");
  });

  it("UniswapV4 returns UniswapSwap", async () => {
    const { UniswapV4AdapterContract } = await import(
      "./contracts/UniswapV4AdapterContract.js"
    );
    const adapter = new UniswapV4AdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("exactInput"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("UniswapSwap");
  });
});

describe("Balancer adapter", () => {
  it("BalancerV3Router returns Swap", async () => {
    const { BalancerV3RouterAdapterContract } = await import(
      "./contracts/BalancerV3RouterAdapterContract.js"
    );
    const adapter = new BalancerV3RouterAdapterContract(options, {
      baseParams,
    });
    const result = adapter.classifyLegacyOperation(
      makeParsed("swap"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("Swap");
  });
});

describe("WstETH + Lido adapters", () => {
  it("WstETHV1: wrap returns WstETHWrap", async () => {
    const { WstETHV1AdapterContract } = await import(
      "./contracts/WstETHV1AdapterContract.js"
    );
    const adapter = new WstETHV1AdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("wrap"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("WstETHWrap");
  });

  it("WstETHV1: unwrap returns WstETHUnwrap", async () => {
    const { WstETHV1AdapterContract } = await import(
      "./contracts/WstETHV1AdapterContract.js"
    );
    const adapter = new WstETHV1AdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("unwrap"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("WstETHUnwrap");
  });

  it("WstETHV1: unknown falls back to Swap", async () => {
    const { WstETHV1AdapterContract } = await import(
      "./contracts/WstETHV1AdapterContract.js"
    );
    const adapter = new WstETHV1AdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("other"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("Swap");
  });

  it("LidoV1 returns LidoSubmit", async () => {
    const { LidoV1AdapterContract } = await import(
      "./contracts/LidoV1AdapterContract.js"
    );
    const adapter = new LidoV1AdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("submit"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("LidoSubmit");
  });
});

describe("ERC4626 adapters", () => {
  it("ERC4626: deposit returns Swap", async () => {
    const { ERC4626AdapterContract } = await import(
      "./contracts/ERC4626AdapterContract.js"
    );
    const adapter = new ERC4626AdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("deposit"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("Swap");
  });

  it("ERC4626: redeem returns MakerRedeem", async () => {
    const { ERC4626AdapterContract } = await import(
      "./contracts/ERC4626AdapterContract.js"
    );
    const adapter = new ERC4626AdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("redeem"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("MakerRedeem");
  });

  it("ERC4626: withdraw returns Swap", async () => {
    const { ERC4626AdapterContract } = await import(
      "./contracts/ERC4626AdapterContract.js"
    );
    const adapter = new ERC4626AdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("withdraw"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("Swap");
  });

  it("ERC4626Referral: deposit returns Swap", async () => {
    const { ERC4626ReferralAdapterContract } = await import(
      "./contracts/ERC4626ReferralAdapterContract.js"
    );
    const adapter = new ERC4626ReferralAdapterContract(options, {
      baseParams,
    });
    const result = adapter.classifyLegacyOperation(
      makeParsed("deposit"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("Swap");
  });
});

describe("DaiUsds adapter", () => {
  it("daiToUsds returns VaultDeposit", async () => {
    const { DaiUsdsAdapterContract } = await import(
      "./contracts/DaiUsdsAdapterContract.js"
    );
    const adapter = new DaiUsdsAdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("daiToUsds"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("VaultDeposit");
  });

  it("usdsToDai returns MakerRedeem", async () => {
    const { DaiUsdsAdapterContract } = await import(
      "./contracts/DaiUsdsAdapterContract.js"
    );
    const adapter = new DaiUsdsAdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("usdsToDai"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("MakerRedeem");
  });

  it("unknown falls back to Swap", async () => {
    const { DaiUsdsAdapterContract } = await import(
      "./contracts/DaiUsdsAdapterContract.js"
    );
    const adapter = new DaiUsdsAdapterContract(options, { baseParams });
    const result = adapter.classifyLegacyOperation(
      makeParsed("something"),
      net(swapTransfers),
    );
    expect(result.operation).toBe("Swap");
  });
});

describe("Legacy adapters throw", () => {
  const legacyAdapters = [
    {
      name: "AccountMigratorAdapterContract",
      path: "./contracts/AccountMigratorAdapterContract.js",
      className: "AccountMigratorAdapterContract",
    },
  ] as const;

  for (const { name, path, className } of legacyAdapters) {
    it(`${name} throws on classifyLegacyOperation`, async () => {
      const mod = await import(path);
      const AdapterClass = mod[className];
      const adapter = new AdapterClass(options, { baseParams });
      expect(() =>
        adapter.classifyLegacyOperation(
          makeParsed("anything"),
          net(swapTransfers),
        ),
      ).toThrow("classifyLegacyOperation is not supported for legacy adapter");
    });
  }
});

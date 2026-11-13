import {
  type Address,
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  stringToHex,
} from "viem";
import { describe, expect, it } from "vitest";
import type { MarketBot } from "../../../accounts/bots/types.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { AssetsMap } from "../../../utils/AssetsMap.js";
import { iAaveHorizonBridgeAdapterAbi } from "../abi/adapters/index.js";
import { AaveHorizonBridgeAdapterContract } from "./AaveHorizonBridgeAdapterContract.js";

const ADAPTER = getAddress("0x1a1C874cCFE034cfb1437c86755d520293A17e27");
const CREDIT_MANAGER = getAddress("0xBAdfE155662646A1A668c00276220B02FB7f1b23");
const BRIDGE = getAddress("0x805CcC01428CE2F4d3ED23F96c2837393172CDb1");
const A_RWA = getAddress("0x7433806912Eae67919e66aea853d46Fa0aef98A8");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const OTHER = getAddress("0x238a700eD6165261Cf8b2e544ba797BC11e466Ba");
const FACADE = getAddress("0x9999999999999999999999999999999999999999");
const BOT = getAddress("0x8888888888888888888888888888888888888888");
const CONFIGURATOR = getAddress("0x7777777777777777777777777777777777777777");
const POOL = getAddress("0xAe05Cd22df81871bc7cC2a04BeCfb516bFe332C8");

/** What `getBots` reports for an `AaveHorizonFinalizerBot`. */
function finalizerBot(args: {
  addr?: Address;
  version?: bigint;
  contractType?: string;
  bridge?: Address;
}): MarketBot {
  return {
    baseParams: {
      addr: args.addr ?? BOT,
      version: args.version ?? 311n,
      contractType: stringToHex(
        args.contractType ?? "BOT::AAVE_HORIZON_FINALIZER",
        { size: 32 },
      ),
      serializedParams: encodeAbiParameters(
        [{ type: "address" }, { type: "address" }],
        [POOL, args.bridge ?? BRIDGE],
      ),
    },
    requiredPermissions: 65636n,
  };
}

/**
 * The facade echoes what it was asked to encode, so a case reads the bot and
 * the permissions back rather than calldata.
 */
function stubSdk(
  bots: readonly MarketBot[],
  allowedBots?: readonly Address[],
): OnchainSDK {
  const rwaFactory = allowedBots && {
    isAllowedBot: async (bot: Address) => allowedBots.includes(bot),
  };
  return {
    accounts: {
      bots: {
        getMarketBots: async (configurator: Address) => {
          expect(configurator).toBe(CONFIGURATOR);
          return bots;
        },
      },
    },
    marketRegister: {
      findByCreditManager: (creditManager: Address) => {
        expect(creditManager).toBe(CREDIT_MANAGER);
        return { configurator: { address: CONFIGURATOR } };
      },
      findCreditManager: (creditManager: Address) => {
        expect(creditManager).toBe(CREDIT_MANAGER);
        return {
          creditFacade: {
            prepareSetBotPermissions: (bot: Address, permissions: bigint) => ({
              target: FACADE,
              bot,
              permissions,
            }),
          },
          rwaFactory,
        };
      },
    },
  } as unknown as OnchainSDK;
}

/** `allowedBots` puts the credit manager behind an RWA factory allowing them. */
function bridgeAdapter(
  bots: readonly MarketBot[] = [],
  allowedBots?: readonly Address[],
): AaveHorizonBridgeAdapterContract {
  return new AaveHorizonBridgeAdapterContract(stubSdk(bots, allowedBots), {
    baseParams: {
      addr: ADAPTER,
      version: 311n,
      contractType: "ADAPTER::AAVE_HORIZON_BRIDGE",
      serializedParams: encodeAbiParameters(
        [
          { type: "address" },
          { type: "address" },
          { type: "address" },
          { type: "address[]" },
          { type: "address[]" },
        ],
        [CREDIT_MANAGER, BRIDGE, BRIDGE, [A_RWA], [USDC]],
      ),
    },
  });
}

const openPosition = (aTokenAmount: bigint, borrowAmount: bigint) =>
  encodeFunctionData({
    abi: iAaveHorizonBridgeAdapterAbi,
    functionName: "openPosition",
    args: [A_RWA, USDC, aTokenAmount, borrowAmount],
  });

const openPositionDiff = (leftoverAmount: bigint, borrowAmount: bigint) =>
  encodeFunctionData({
    abi: iAaveHorizonBridgeAdapterAbi,
    functionName: "openPositionDiff",
    args: [A_RWA, USDC, leftoverAmount, borrowAmount],
  });

describe("AaveHorizonBridgeAdapterContract — serialized params and calls", () => {
  it("decodes the bridge and both allowlists", () => {
    const adapter = bridgeAdapter();

    expect(adapter.creditManager).toBe(CREDIT_MANAGER);
    expect(adapter.bridge).toBe(BRIDGE);
    expect(adapter.allowedATokens).toEqual([A_RWA]);
    expect(adapter.allowedDebtTokens).toEqual([USDC]);
    expect(adapter.isATokenAllowed(A_RWA.toLowerCase() as `0x${string}`)).toBe(
      true,
    );
    expect(adapter.isATokenAllowed(OTHER)).toBe(false);
    expect(adapter.isDebtTokenAllowed(USDC)).toBe(true);
    expect(adapter.isDebtTokenAllowed(A_RWA)).toBe(false);
  });

  it("openPositionDiffCall targets the adapter with the leftover and the borrow", () => {
    expect(bridgeAdapter().openPositionDiffCall(A_RWA, USDC, 0n, 50n)).toEqual({
      target: ADAPTER,
      callData: openPositionDiff(0n, 50n),
    });
  });
});

describe("AaveHorizonBridgeAdapterContract.openingCalls", () => {
  it("grants the finalizer bot the market lists for this bridge the permissions it requires", async () => {
    const adapter = bridgeAdapter([finalizerBot({})]);

    expect(await adapter.openingCalls()).toEqual([
      { target: FACADE, bot: BOT, permissions: 65636n },
    ]);
  });

  it("takes the latest version where the market lists several", async () => {
    const adapter = bridgeAdapter([
      finalizerBot({ addr: OTHER, version: 311n }),
      finalizerBot({ version: 312n }),
    ]);

    expect(await adapter.openingCalls()).toEqual([
      { target: FACADE, bot: BOT, permissions: 65636n },
    ]);
  });

  it("passes over a finalizer of another bridge and bots of another type", async () => {
    const adapter = bridgeAdapter([
      finalizerBot({ bridge: OTHER }),
      finalizerBot({ contractType: "BOT::PARTIAL_LIQUIDATION" }),
    ]);

    expect(await adapter.openingCalls()).toEqual([]);
  });

  it("adds no opening call where the market lists no finalizer", async () => {
    expect(await bridgeAdapter().openingCalls()).toEqual([]);
  });

  describe("behind an RWA factory", () => {
    const SECURITIZE = "BOT::AAVE_HORIZON_SECURITIZE";

    it("grants the Securitize finalizer the factory allows, not the plain one", async () => {
      const adapter = bridgeAdapter(
        [
          finalizerBot({ addr: OTHER }),
          finalizerBot({ contractType: SECURITIZE }),
        ],
        [BOT, OTHER],
      );

      expect(await adapter.openingCalls()).toEqual([
        { target: FACADE, bot: BOT, permissions: 65636n },
      ]);
    });

    it("adds no opening call where the factory does not allow the bot", async () => {
      const adapter = bridgeAdapter(
        [finalizerBot({ contractType: SECURITIZE })],
        [],
      );

      expect(await adapter.openingCalls()).toEqual([]);
    });

    it("adds no opening call where the market lists only the plain finalizer", async () => {
      expect(
        await bridgeAdapter([finalizerBot({})], [BOT]).openingCalls(),
      ).toEqual([]);
    });
  });
});

describe("AaveHorizonBridgeAdapterContract.replayOutOfBracketCall", () => {
  it("openPosition: the aTokens leave, the borrowed debt token arrives", () => {
    const balances = new AssetsMap([[A_RWA, 100n]]);

    expect(
      bridgeAdapter().replayOutOfBracketCall(balances, openPosition(100n, 50n)),
    ).toBe(true);
    expect(balances.getOrZero(A_RWA)).toBe(0n);
    expect(balances.getOrZero(USDC)).toBe(50n);
  });

  it("openPositionDiff: every aToken above the leftover leaves, the borrow arrives", () => {
    const balances = new AssetsMap([[A_RWA, 99n]]);

    expect(
      bridgeAdapter().replayOutOfBracketCall(
        balances,
        openPositionDiff(0n, 50n),
      ),
    ).toBe(true);
    expect(balances.getOrZero(A_RWA)).toBe(0n);
    expect(balances.getOrZero(USDC)).toBe(50n);
  });

  it("openPositionDiff at or below the leftover moves nothing, as the adapter returns early", () => {
    const balances = new AssetsMap([[A_RWA, 5n]]);

    expect(
      bridgeAdapter().replayOutOfBracketCall(
        balances,
        openPositionDiff(5n, 50n),
      ),
    ).toBe(true);
    expect(balances.getOrZero(A_RWA)).toBe(5n);
    expect(balances.getOrZero(USDC)).toBe(0n);
  });

  it("closePosition: the repayment leaves, the aTokens come back", () => {
    const balances = new AssetsMap([[USDC, 80n]]);
    const calldata = encodeFunctionData({
      abi: iAaveHorizonBridgeAdapterAbi,
      functionName: "closePosition",
      args: [A_RWA, USDC, 50n, 100n],
    });

    expect(bridgeAdapter().replayOutOfBracketCall(balances, calldata)).toBe(
      true,
    );
    expect(balances.getOrZero(USDC)).toBe(30n);
    expect(balances.getOrZero(A_RWA)).toBe(100n);
  });

  it("anything else is not legal outside a bracket", () => {
    const calldata = encodeFunctionData({
      abi: iAaveHorizonBridgeAdapterAbi,
      functionName: "setATokenStatusBatch",
      args: [[{ token: A_RWA, allowed: false }]],
    });

    expect(
      bridgeAdapter().replayOutOfBracketCall(new AssetsMap(), calldata),
    ).toBe(false);
  });
});

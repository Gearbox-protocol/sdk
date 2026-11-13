import { type Address, encodeAbiParameters } from "viem";
import { describe, expect, it, vi } from "vitest";
import { RAY } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import { AaveHorizonBridgeAdapterContract } from "../../../market/adapters/contracts/AaveHorizonBridgeAdapterContract.js";
import { AaveV3PoolAdapterContract } from "../../../market/adapters/contracts/AaveV3PoolAdapterContract.js";
import { SecuritizeRedemptionGatewayAdapterContract } from "../../../market/adapters/contracts/SecuritizeRedemptionGatewayAdapterContract.js";
import { encodeDelayedIntent } from "../../withdrawal-compressor/intent-codec.js";
import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectOpsArrayExact,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  CREDIT_MANAGER,
  caToken,
  DECIMALS,
  MAX_DEBT,
  type MarketSdkExtras,
  POS,
  POS2,
  RWA_ASSET,
  UND,
  WALLET,
} from "../testing/market.js";
import { CA_OP_CALLS } from "../testing/sdk-mock.js";
import type { AaveHoldings, DelayedStartResult } from "../types.js";

/**
 * `CLOSE_AAVE_POSITION` — the owner's Aave Horizon position comes back to an
 * account that holds nothing and is requested for redemption, in one
 * transaction.
 *
 * The market is the one the other specs use, `POS` 1:1 with `UND`. The owner
 * holds 2000 UND worth of `POS` aTokens on Aave and owes 1000 UND there, at a
 * rate of 8.76% a year, which is exactly 0.01 UND an hour. `POS` redeems
 * through a Securitize gateway into `UND` at a NAV of 1, and `POS2` plays the
 * redemption phantom.
 */

/** 2000 UND worth of aTokens. */
const SUPPLIED = 200000000000n;
/** 1000 UND owed on Aave. */
const OWED = 100000000000n;
/** 8.76% a year, in ray. */
const BORROW_RATE = (RAY * 876n) / 10000n;
/** An hour of {@link BORROW_RATE} on {@link OWED}. */
const INTEREST = 1000000n;
/** A NAV of 1, in `POS` decimals. */
const NAV_RATE = 100000000n;
const NOW = 1_000_000;
/** The mock compressor's withdrawal length. */
const WITHDRAWAL_LENGTH = 172_800n;

const PHANTOM = POS2;
const A_POS = "0x5555555555555555555555555555555555555555" as Address;
const OTHER = "0x6666666666666666666666666666666666666666" as Address;
const AAVE_POOL = "0x7777777777777777777777777777777777777777" as Address;
const BRIDGE = "0x8888888888888888888888888888888888888888" as Address;
const POOL_ADAPTER = "0x9999999999999999999999999999999999999999" as Address;
const BRIDGE_ADAPTER = "0xabababababababababababababababababababab" as Address;
const GATEWAY = "0xcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd" as Address;
const GATEWAY_ADAPTER = "0xefefefefefefefefefefefefefefefefefefefef" as Address;
const NAV_PROVIDER = "0x1212121212121212121212121212121212121212" as Address;

let navRate = NAV_RATE;

/**
 * What the adapters read from the chain: the pool's aToken of every asset, the
 * gateway's NAV provider and its rate.
 */
const chain = {
  client: {
    readContract: vi.fn(async ({ functionName }: { functionName: string }) => {
      switch (functionName) {
        case "navProvider":
          return NAV_PROVIDER;
        case "rate":
          return navRate;
        default:
          return A_POS;
      }
    }),
  },
  tokensMeta: {
    decimals: (token: Address) => DECIMALS[token.toLowerCase() as Address],
  },
} as unknown as OnchainSDK;

function poolAdapter(assets: Address[] = [POS]): AaveV3PoolAdapterContract {
  return new AaveV3PoolAdapterContract(chain, {
    baseParams: {
      addr: POOL_ADAPTER,
      version: 311n,
      contractType: "ADAPTER::AAVE_V3_POOL",
      serializedParams: encodeAbiParameters(
        [
          { type: "address" },
          { type: "address" },
          { type: "address" },
          { type: "uint16" },
          { type: "address[]" },
        ],
        [CREDIT_MANAGER, AAVE_POOL, AAVE_POOL, 0, assets],
      ),
    },
  });
}

function bridgeAdapter(
  debtTokens: Address[] = [UND],
): AaveHorizonBridgeAdapterContract {
  return new AaveHorizonBridgeAdapterContract(chain, {
    baseParams: {
      addr: BRIDGE_ADAPTER,
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
        [CREDIT_MANAGER, BRIDGE, BRIDGE, [A_POS], debtTokens],
      ),
    },
  });
}

function gatewayAdapter(
  phantom: Address = PHANTOM,
): SecuritizeRedemptionGatewayAdapterContract {
  return new SecuritizeRedemptionGatewayAdapterContract(chain, {
    baseParams: {
      addr: GATEWAY_ADAPTER,
      version: 311n,
      contractType: "ADAPTER::SECURITIZE_REDEMPTION_GATEWAY",
      serializedParams: encodeAbiParameters(
        [
          { type: "address" },
          { type: "address" },
          { type: "address" },
          { type: "address" },
          { type: "address" },
        ],
        [CREDIT_MANAGER, GATEWAY, POS, UND, phantom],
      ),
    },
  });
}

function run(opts?: {
  market?: MarketSdkExtras;
  holdings?: Partial<AaveHoldings>;
  token?: Address;
  tokens?: ReturnType<typeof caToken>[];
}): Promise<DelayedStartResult> {
  const sdk = buildMarketSdk({
    adapters: [poolAdapter(), bridgeAdapter(), gatewayAdapter()],
    delayed: { [POS]: [{ withdrawalPhantomToken: PHANTOM }] },
    phantoms: [PHANTOM],
    timestamp: NOW,
    ...opts?.market,
  });
  return new CreditAccountOperationsService(sdk).startDelayedIntent({
    intent: {
      type: "CLOSE_AAVE_POSITION",
      token: opts?.token ?? POS,
      to: WALLET,
      holdings: {
        aToken: A_POS,
        debtToken: UND,
        supplied: SUPPLIED,
        owed: OWED,
        borrowRate: BORROW_RATE,
        ...opts?.holdings,
      },
    },
    creditAccount: buildFixtureCreditAccount({
      totalDebt: 0n,
      tokens: opts?.tokens ?? [],
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
}

function started(
  result: DelayedStartResult,
): Extract<DelayedStartResult, { ok: true }> {
  if (!result.ok) {
    throw new Error(`expected a preview, got ${result.error.code}`);
  }
  return result;
}

describe("closeAavePosition.start — the Aave position comes back and is redeemed", () => {
  it("borrows the Aave debt and an hour of interest, repays it through the bridge, withdraws the RWA and redeems whatever arrives", async () => {
    const pool = poolAdapter();
    const bridge = bridgeAdapter();
    const gateway = gatewayAdapter();
    const close = bridge.closePositionCall(
      A_POS,
      UND,
      OWED + INTEREST,
      SUPPLIED,
    );
    const withdraw = pool.withdrawDiffCall(POS, 0n);
    // Names no amount: the RWA it redeems is not on the account yet.
    const extraData = encodeDelayedIntent({
      type: "CLOSE_ACCOUNT",
      to: WALLET,
    });
    const redeem = gateway.redeemDiffCall(0n, extraData);
    // ...and still reads back as the request it is.
    expect(gateway.parseDelayedWithdrawalRequest(redeem.callData)).toEqual({
      phantomToken: PHANTOM,
      claimToken: UND,
      extraData,
    });

    const result = started(
      await run({ market: { adapters: [pool, bridge, gateway] } }),
    );

    expectOpsArrayExact(result.operations, [
      ...withOnchainOpCalls([
        { type: "increaseDebt", amount: OWED + INTEREST },
        {
          type: "aaveClosePosition",
          aToken: A_POS,
          aTokenAmount: SUPPLIED,
          debtToken: UND,
          repayAmount: OWED + INTEREST,
          calls: [close],
        },
        {
          type: "aaveWithdraw",
          token: POS,
          aToken: A_POS,
          amount: SUPPLIED,
          calls: [withdraw],
        },
      ]),
      {
        type: "startDelayedWithdrawal",
        token: POS,
        amountIn: SUPPLIED,
        outputs: [{ token: PHANTOM, isDelayed: true, amount: SUPPLIED }],
        settlement: "delayed",
        calls: [redeem],
      },
      ...result.operations.slice(4),
    ]);
    expect(result.calls.slice(0, 4)).toEqual([
      CA_OP_CALLS.increaseDebt,
      close,
      withdraw,
      redeem,
    ]);
    expect(result.delayed).toMatchObject({
      record: { type: "CLOSE_ACCOUNT", to: WALLET },
      settlement: "delayed",
      claimableAt: BigInt(NOW) + WITHDRAWAL_LENGTH,
      claim: { token: UND, amount: SUPPLIED },
    });
    const { afterRequest } = result.delayed;
    expect(afterRequest.totalDebt.value).toBe(OWED + INTEREST);
    expect(assetBalance(afterRequest.assets, POS)).toBe(0n);
    expect(assetBalance(afterRequest.assets, PHANTOM)).toBe(SUPPLIED);
    // The exit's tail settles the loan out of the claim.
    expect(result.state.totalDebt.value).toBe(0n);
  });

  it("values the redemption at the gateway's NAV", async () => {
    navRate = (NAV_RATE * 11n) / 10n;
    try {
      const result = started(await run());
      expect(
        result.operations.find(op => op.type === "startDelayedWithdrawal"),
      ).toMatchObject({
        outputs: [
          { token: PHANTOM, isDelayed: true, amount: (SUPPLIED * 11n) / 10n },
        ],
      });
    } finally {
      navRate = NAV_RATE;
    }
  });

  it("rounds the hour of interest up", async () => {
    const result = started(
      await run({ holdings: { borrowRate: BORROW_RATE + 1n } }),
    );

    expect(
      result.operations.find(op => op.type === "aaveClosePosition"),
    ).toMatchObject({ repayAmount: OWED + INTEREST + 1n });
  });

  it("redeems what the account already held of the RWA along with it", async () => {
    const result = started(await run({ tokens: [caToken(POS, 5n, 0n)] }));

    expect(
      result.operations.find(op => op.type === "startDelayedWithdrawal"),
    ).toMatchObject({ amountIn: SUPPLIED + 5n });
  });

  it("RWA market: borrows the underlying and unwraps it into the asset Aave lends", async () => {
    const result = started(
      await run({
        market: {
          adapters: [
            poolAdapter(),
            bridgeAdapter([RWA_ASSET]),
            gatewayAdapter(),
          ],
          rwaAssets: { [UND]: RWA_ASSET },
        },
        holdings: { debtToken: RWA_ASSET },
      }),
    );

    expect(result.operations.map(op => op.type).slice(0, 5)).toEqual([
      "increaseDebt",
      "unwrapRwaCollateral",
      "aaveClosePosition",
      "aaveWithdraw",
      "startDelayedWithdrawal",
    ]);
    expect(result.operations[1]).toMatchObject({
      tokenIn: UND,
      amount: OWED + INTEREST,
      tokenOut: RWA_ASSET,
    });
    expect(result.operations[2]).toMatchObject({
      debtToken: RWA_ASSET,
      repayAmount: OWED + INTEREST,
    });
    expect(result.delayed.afterRequest.totalDebt.value).toBe(OWED + INTEREST);
  });

  it("refuses an RWA whose redemption cannot take a balance it is not shown", async () => {
    expectPreviewError(
      await run({
        market: { adapters: [poolAdapter(), bridgeAdapter()] },
      }),
      "noDelayedRoute",
    );
  });

  it("refuses an RWA with no redemption at all", async () => {
    expectPreviewError(
      await run({ market: { delayed: {} } }),
      "noDelayedRoute",
    );
  });

  it("refuses an owner with no aTokens of the RWA", async () => {
    expectPreviewError(
      await run({ holdings: { supplied: 0n } }),
      "unsupportedCollateralToken",
    );
  });

  it("refuses the underlying", async () => {
    expectPreviewError(await run({ token: UND }), "unsupportedCollateralToken");
  });

  it("refuses an owner who owes nothing on Aave", async () => {
    expectPreviewError(await run({ holdings: { owed: 0n } }), "debtOutOfRange");
  });

  it("refuses a loan below the facade's minimum", async () => {
    expectPreviewError(
      await run({ market: { minDebt: OWED * 2n } }),
      "debtOutOfRange",
    );
  });

  it("refuses a loan above the facade's maximum", async () => {
    expectPreviewError(
      await run({ holdings: { owed: MAX_DEBT } }),
      "debtOutOfRange",
    );
  });

  it("refuses a pool adapter that does not list the RWA", async () => {
    expectPreviewError(
      await run({
        market: {
          adapters: [poolAdapter([OTHER]), bridgeAdapter(), gatewayAdapter()],
        },
      }),
      "unsupportedCollateralToken",
    );
  });
});

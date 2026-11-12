import { type Address, encodeAbiParameters } from "viem";
import { describe, expect, it, vi } from "vitest";
import { MIN_INT96 } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import { AaveHorizonBridgeAdapterContract } from "../../../market/adapters/contracts/AaveHorizonBridgeAdapterContract.js";
import { AaveV3PoolAdapterContract } from "../../../market/adapters/contracts/AaveV3PoolAdapterContract.js";
import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  CREDIT_MANAGER,
  caToken,
  POS,
  UND,
} from "../testing/market.js";
import { CA_OP_CALLS } from "../testing/sdk-mock.js";
import type { IntentPreviewResult } from "../types.js";

/**
 * `MOVE_TO_AAVE` — a minted position leaves the account for Aave Horizon.
 *
 * The market is the one the other specs use: 2000 UND of position against 1000
 * of debt, `POS` 1:1 with `UND`. The credit manager lists an Aave pool adapter
 * for `POS` and a Horizon bridge adapter that takes its aToken against `UND`.
 */

/** 2000 UND of position, held in the 1:1 token. */
const HELD_POS = 200000000000n;
/** 1000 UND of debt. */
const DEBT = 100000000000n;
/** LT-weighted quota bought for the position, 92% of its value. */
const QUOTA_POS = 184000000000n;
/** The headroom Aave lends on top of the debt: 10bps of it. */
const MARGIN = DEBT / 1000n;

const A_POS = "0x5555555555555555555555555555555555555555" as Address;
const OTHER = "0x6666666666666666666666666666666666666666" as Address;
const AAVE_POOL = "0x7777777777777777777777777777777777777777" as Address;
const BRIDGE = "0x8888888888888888888888888888888888888888" as Address;
const POOL_ADAPTER = "0x9999999999999999999999999999999999999999" as Address;
const BRIDGE_ADAPTER = "0xabababababababababababababababababababab" as Address;

/** What the adapters read from the chain: the pool's aToken of every asset. */
const chain = {
  client: { readContract: vi.fn(async () => A_POS) },
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

function run(opts?: {
  adapters?: Array<
    AaveV3PoolAdapterContract | AaveHorizonBridgeAdapterContract
  >;
  totalDebt?: bigint;
}): Promise<IntentPreviewResult> {
  const sdk = buildMarketSdk({
    adapters: opts?.adapters ?? [poolAdapter(), bridgeAdapter()],
  });
  return new CreditAccountOperationsService(sdk).startIntent({
    intent: { type: "MOVE_TO_AAVE", token: POS },
    creditAccount: buildFixtureCreditAccount({
      totalDebt: opts?.totalDebt ?? DEBT,
      tokens: [caToken(POS, HELD_POS, QUOTA_POS)],
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
}

describe("moveToAave.start — the position leaves, Aave settles the loan", () => {
  it("supplies, hands the aTokens over with a loan, drops quotas, repays in full", async () => {
    const pool = poolAdapter();
    const bridge = bridgeAdapter();
    // Both calls name no amount, as the finalizer bot's do.
    const supply = pool.supplyDiffCall(POS, 0n);
    const open = bridge.openPositionDiffCall(A_POS, UND, 0n, DEBT + MARGIN);

    const result = await run({ adapters: [pool, bridge] });
    const state = expectAdjustPreview(result, {
      // What Aave lent beyond the debt is all the account keeps.
      totalValue: MARGIN,
      totalDebt: 0n,
      expectedOps: withOnchainOpCalls([
        {
          type: "aaveSupply",
          token: POS,
          aToken: A_POS,
          amount: HELD_POS,
          calls: [supply],
        },
        {
          type: "aaveOpenPosition",
          aToken: A_POS,
          aTokenAmount: HELD_POS,
          debtToken: UND,
          borrowAmount: DEBT + MARGIN,
          calls: [open],
        },
        {
          type: "changeQuota",
          quotaIncrease: [],
          quotaDecrease: [{ token: POS, balance: MIN_INT96 }],
          desiredQuota: {},
        },
        { type: "decreaseDebt", amount: DEBT },
      ]),
      expectedCalls: [
        supply,
        open,
        CA_OP_CALLS.changeQuota,
        CA_OP_CALLS.decreaseDebt,
      ],
    });

    expect(state.quotas).toEqual([]);
    expect(assetBalance(state.assets, POS)).toBe(0n);
    expect(assetBalance(state.assets, A_POS)).toBe(0n);
    expect(assetBalance(state.assets, UND)).toBe(MARGIN);
  });

  it("asks the facade for all of the debt, as a settlement does", async () => {
    const result = await run();
    if (!result.ok) {
      throw new Error(`expected a preview, got ${result.error.code}`);
    }

    expect(
      result.operations.find(op => op.type === "decreaseDebt"),
    ).toMatchObject({ amount: DEBT, full: true });
  });

  it("refuses a credit manager with no Aave adapters", async () => {
    expectPreviewError(
      await run({ adapters: [] }),
      "unsupportedCollateralToken",
    );
  });

  it("refuses a pool adapter that does not list the collateral", async () => {
    expectPreviewError(
      await run({ adapters: [poolAdapter([OTHER]), bridgeAdapter()] }),
      "unsupportedCollateralToken",
    );
  });

  it("refuses a bridge that does not lend the underlying", async () => {
    expectPreviewError(
      await run({ adapters: [poolAdapter(), bridgeAdapter([OTHER])] }),
      "unsupportedCollateralToken",
    );
  });

  it("refuses an account that owes nothing", async () => {
    expectPreviewError(await run({ totalDebt: 0n }), "debtOutOfRange");
  });
});

import { type Hex, parseUnits } from "viem";
import type { StrategyOpportunityKey } from "../../model/index.js";
import type { CreditSuite } from "../../onchain/index.js";
import type { GearboxSDK } from "../../sdk/index.js";
import {
  AnvilAccountEnvironment,
  type AnvilAccountEnvironmentOptions,
  type AnvilAccountTarget,
} from "../AnvilAccountEnvironment.js";
import type { AnvilClient } from "../createAnvilClient.js";
import { AnvilJourneySession } from "./AnvilJourneySession.js";
import { planOpening } from "./planning.js";
import { type CoreJourney, runStrategyJourneys } from "./run.js";
import {
  type JourneyResult,
  type JourneySessionOptions,
  JourneyUnavailable,
} from "./types.js";

export interface AnvilJourneyOptions {
  anvil: AnvilClient;
  /** A new SDK connected to the same exclusive fork for every journey. */
  createSdk(): GearboxSDK<"onchain">;
  strategy: StrategyOpportunityKey;
  journeys?: readonly CoreJourney[];
  environment?: AnvilAccountEnvironmentOptions;
  /** Whole funding tokens. Omitted sizes an opening from market limits. */
  collateral?: string;
  /** Whole pool-underlying tokens; an optional pool top-up per isolated journey. */
  poolDeposit?: string;
  leverage?: bigint;
  slippage?: number;
  route?: "auto" | "instant" | "delayed";
  settle?: JourneySessionOptions["settle"];
  onResult?(result: JourneyResult): void;
}

/** Requires exclusive access to the fork: each journey rolls its entire state back. */
export async function runAnvilStrategyJourneys(options: AnvilJourneyOptions) {
  const { anvil, strategy: key } = options;
  if ((await anvil.getChainId()) !== key.chainId)
    throw new Error("RPC chain ID does not match the strategy");
  await anvil.anvilNodeInfo();
  return runStrategyJourneys({
    strategy: key,
    journeys: options.journeys,
    onResult: options.onResult,
    valueToleranceBps: Math.max(100, (options.slippage ?? 50) * 2),
    isolation: {
      snapshot: () => anvil.snapshot(),
      restore: id => revert(anvil, id),
    },
    withSession: async run => {
      const sdk = options.createSdk();
      // Empty pools are hidden from strategy opportunities until they are funded.
      await sdk.attach();
      const environment = AnvilAccountEnvironment.fromGearbox(sdk, {
        allowMint: true,
        ...options.environment,
        chainId: key.chainId,
      });
      const suite = environment.sdk.marketRegister.findCreditManager(
        key.creditManager,
      );
      await assertStrategyActive(anvil, suite);
      if (options.poolDeposit)
        await topUpPool(environment, suite, options.poolDeposit);
      const strategy = (await sdk.opportunities.getStrategy(key)).data;
      const opening = planOpening(strategy, {
        collateral:
          options.collateral === undefined
            ? undefined
            : parseUnits(options.collateral, strategy.underlyingToken.decimals),
        leverage: options.leverage,
      });
      const target = {
        creditManager: key.creditManager,
        target: strategy.targetCollateral.address,
      };
      await prepareBorrower(environment, {
        ...target,
        collateral: {
          token: strategy.underlyingToken.address,
          balance: opening.collateral,
        },
      });
      await environment.grantKycAccess([target]);
      await environment.sync();
      return run(
        new AnvilJourneySession({
          sdk,
          environment,
          key,
          strategy,
          ...opening,
          slippage: options.slippage ?? 50,
          route: options.route ?? "auto",
          settle: options.settle,
        }),
      );
    },
  });
}

async function revert(anvil: AnvilClient, id: Hex): Promise<void> {
  // viem types this test RPC as void; Anvil returns a success boolean.
  const restored: unknown = await anvil.request({
    method: "evm_revert",
    params: [id],
  });
  if (!restored) throw new Error(`Anvil refused snapshot ${id}`);
}

async function assertStrategyActive(
  anvil: AnvilClient,
  suite: CreditSuite,
): Promise<void> {
  const expired =
    suite.expirationDate !== null &&
    suite.expirationDate <= Number((await anvil.getBlock()).timestamp);
  if (suite.isPaused || expired)
    throw new JourneyUnavailable(
      "blocked",
      "The selected strategy is paused or expired",
    );
}

/** RWA pools are funded through the SDK's zapper route from the backing asset. */
async function topUpPool(
  environment: AnvilAccountEnvironment,
  suite: CreditSuite,
  amount: string,
): Promise<void> {
  const [deposit] = await environment.topUpPools([
    [
      suite.pool,
      parseUnits(amount, environment.sdk.tokensMeta.decimals(suite.underlying)),
    ],
  ]);
  if (!deposit?.success)
    throw new JourneyUnavailable(
      "blocked",
      "Could not top up the strategy pool",
      { cause: deposit && !deposit.success ? deposit.error : undefined },
    );
  await environment.sync();
}

async function prepareBorrower(
  environment: AnvilAccountEnvironment,
  target: AnvilAccountTarget,
): Promise<void> {
  try {
    await environment.prepareBorrower([target]);
  } catch (error) {
    throw new JourneyUnavailable(
      "blocked",
      "Borrower setup failed on this fork",
      { cause: error },
    );
  }
}

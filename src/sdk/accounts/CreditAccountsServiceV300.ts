import { iCurveV1_2AssetsAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, parseAbi } from "abitype";
import { encodeFunctionData } from "viem";
import { iBaseRewardPoolAbi } from "../../abi/iBaseRewardPool.js";
import { NOT_DEPLOYED } from "../constants/addresses.js";
import { MAX_UINT256 } from "../constants/math.js";
import type { Asset } from "../router/types.js";
import {
  type AuraStakedToken,
  type AuraStakedTokenData,
  auraStakedTokens,
  auraTokens,
  type ConvexPhantomTokenData,
  type ConvexStakedPhantomToken,
  contractsByNetwork,
  convexStakedPhantomTokens,
  convexTokens,
  getTokenSymbol_Legacy,
  isAuraStakedToken,
  isConvexStakedPhantomToken,
  isStakingRewardsPhantomToken,
  type StakingRewardsPhantomToken,
  type StakingRewardsPhantomTokenData,
  type SupportedContract,
  type SupportedToken,
  stakingRewardsTokens,
  tokenDataByNetwork,
} from "../sdk-gov-legacy/index.js";
import type { MultiCall } from "../types/transactions.js";
import { AbstractCreditAccountService } from "./AbstractCreditAccountsService.js";
import type {
  ClaimFarmRewardsProps,
  CreditAccountOperationResult,
  ICreditAccountsService,
  LlamathenaProportionalWithdrawProps,
  PreviewWithdrawLlamathenaProportionallyProps,
  PreviewWithdrawLlamathenaProportionallyResult,
  RepayAndLiquidateCreditAccountProps,
  RepayCreditAccountProps,
  SetBotProps,
  WithdrawCollateralProps,
} from "./types.js";

export class CreditAccountServiceV300
  extends AbstractCreditAccountService
  implements ICreditAccountsService
{
  /**
   * Implements {@link ICreditAccountsService.setBot}
   */
  setBot(_: SetBotProps): Promise<CreditAccountOperationResult> {
    throw new Error(
      "Not implemented in router v3.0. Try direct call setBotPermissions instead.",
    );
  }

  /**
   * Implements {@link ICreditAccountsService.withdrawCollateral}
   */
  async withdrawCollateral({
    creditAccount,
    assetsToWithdraw: wrapped,
    to,

    minQuota,
    averageQuota,
  }: WithdrawCollateralProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade({
      creditManager: creditAccount.creditManager,
      creditAccount,
    });

    const { unwrapCalls, assetsToWithdraw } =
      this.#prepareUnwrapAndWithdrawCallsV3(
        wrapped,
        false,
        false,
        creditAccount.creditManager,
      );

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...unwrapCalls,
      ...assetsToWithdraw.map(a =>
        this.prepareWithdrawToken(
          creditAccount.creditFacade,
          a.token,
          a.balance,
          to,
        ),
      ),
      ...this.prepareUpdateQuotas(creditAccount.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Implements {@link ICreditAccountsService.repayCreditAccount}
   */
  async repayCreditAccount({
    operation,
    collateralAssets,
    assetsToWithdraw: wrapped,
    creditAccount: ca,
    permits,
    to,
  }: RepayCreditAccountProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const priceUpdates = await this.getPriceUpdatesForFacade({
      creditManager: ca.creditManager,
      creditAccount: ca,
    });

    const { unwrapCalls, assetsToWithdraw } =
      this.#prepareUnwrapAndWithdrawCallsV3(
        wrapped,
        true,
        true,
        ca.creditManager,
      );

    const calls: Array<MultiCall> = [
      ...(operation === "close" ? [] : priceUpdates),
      ...this.prepareAddCollateral(ca.creditFacade, addCollateral, permits),
      ...this.prepareDisableQuotas(ca),
      ...this.prepareDecreaseDebt(ca),
      ...unwrapCalls,
      ...this.prepareDisableTokens(ca),
      ...assetsToWithdraw.map(t =>
        this.prepareWithdrawToken(ca.creditFacade, t.token, MAX_UINT256, to),
      ),
    ];

    const tx =
      operation === "close"
        ? cm.creditFacade.closeCreditAccount(ca.creditAccount, calls)
        : cm.creditFacade.multicall(ca.creditAccount, calls);
    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Implements {@link ICreditAccountsService.repayAndLiquidateCreditAccount}
   */
  async repayAndLiquidateCreditAccount({
    collateralAssets,
    assetsToWithdraw: wrapped,
    creditAccount: ca,
    permits,
    to,
  }: RepayAndLiquidateCreditAccountProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const priceUpdates = await this.getPriceUpdatesForFacade({
      creditManager: ca.creditManager,
      creditAccount: ca,
    });

    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const { unwrapCalls, assetsToWithdraw } =
      this.#prepareUnwrapAndWithdrawCallsV3(
        wrapped,
        true,
        true,
        ca.creditManager,
      );

    const calls: Array<MultiCall> = [
      ...priceUpdates,
      ...this.prepareAddCollateral(ca.creditFacade, addCollateral, permits),
      ...unwrapCalls,
      ...assetsToWithdraw.map(t =>
        this.prepareWithdrawToken(ca.creditFacade, t.token, MAX_UINT256, to),
      ),
    ];

    const tx = cm.creditFacade.liquidateCreditAccount(
      ca.creditAccount,
      to,
      calls,
    );
    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Implements {@link ICreditAccountsService.claimFarmRewards}
   */
  async claimFarmRewards({
    tokensToDisable,
    calls: claimCalls,
    creditAccount: ca,

    minQuota,
    averageQuota,
  }: ClaimFarmRewardsProps): Promise<CreditAccountOperationResult> {
    if (claimCalls.length === 0) throw new Error("No path to execute");

    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade({
      creditManager: ca.creditManager,
      creditAccount: ca,
    });

    const calls = [
      ...priceUpdatesCalls,
      ...claimCalls,
      ...tokensToDisable.map(a =>
        this.prepareDisableToken(ca.creditFacade, a.token),
      ),
      ...this.prepareUpdateQuotas(ca.creditFacade, { minQuota, averageQuota }),
    ];

    const tx = cm.creditFacade.multicall(ca.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  async previewWithdrawLlamathenaProportionally({
    llamathena,
  }: PreviewWithdrawLlamathenaProportionallyProps): Promise<PreviewWithdrawLlamathenaProportionallyResult> {
    const LLAMATHENA_CURVE_POOL: Address =
      "0xd29f8980852c2c76fc3f6e96a7aa06e0bedcc1b1".toLowerCase() as Address;

    const llamathenaBalance = llamathena.balance;
    if (llamathenaBalance === 0n) {
      return {
        stkLlamathena: [llamathena],
        assets: [
          {
            token: LLAMATHENA_CURVE_POOL,
            balance: 0n,
          },
        ],
      };
    }

    return {
      stkLlamathena: [llamathena],
      assets: [
        {
          token: LLAMATHENA_CURVE_POOL,
          balance: llamathenaBalance,
        },
      ],
    };
  }
  async withdrawLlamathenaProportionally({
    preview,
    creditAccount: ca,
    minQuota,
    averageQuota,
  }: LlamathenaProportionalWithdrawProps) {
    const LLAMATHENA_BASE_REWARD_POOL: Address =
      "0x11fd8801a051b296e337a3e1168839fb346d5940";

    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const priceUpdatesCalls = await this.getPriceUpdatesForFacade({
      creditManager: ca.creditManager,
      creditAccount: ca,
      desiredQuotas: averageQuota,
    });

    const baseRewardPoolAdapter = cm.creditManager.adapters.get(
      LLAMATHENA_BASE_REWARD_POOL,
    );
    if (!baseRewardPoolAdapter) {
      throw new Error("BaseRewardPool adapter for llamathena is missing");
    }

    const storeExpectedBalances: MultiCall = {
      target: cm.creditFacade.address,
      callData: encodeFunctionData({
        abi: cm.creditFacade.abi,
        functionName: "storeExpectedBalances",
        args: [
          [
            {
              token: preview.assets[0].token,
              amount: preview.assets[0].balance,
            },
          ],
        ],
      }),
    };

    const withdrawAndUnwrapCall: MultiCall = {
      target: baseRewardPoolAdapter.address,
      callData: encodeFunctionData({
        abi: iBaseRewardPoolAbi,
        functionName: "withdrawAndUnwrap",
        args: [preview.stkLlamathena[0].balance, false],
      }),
    };

    const compareBalances: MultiCall = {
      target: cm.creditFacade.address,
      callData: encodeFunctionData({
        abi: cm.creditFacade.abi,
        functionName: "compareBalances",
        args: [],
      }),
    };

    const swapCalls: Array<MultiCall> = [
      storeExpectedBalances,
      withdrawAndUnwrapCall,
      compareBalances,
    ];

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...swapCalls,
      ...this.prepareUpdateQuotas(ca.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const tx = cm.creditFacade.multicall(ca.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * unwraps staked tokens and optionally claims associated rewards; Should be remove after transition to 3.1
   * @param acc
   * @returns
   */
  #prepareUnwrapAndWithdrawCallsV3(
    assets: Array<Asset>,
    claim: boolean,
    withdrawAll: boolean,
    creditManager: Address,
  ) {
    const network = this.sdk.networkType;
    const suite = this.sdk.marketRegister.findCreditManager(creditManager);

    const cmAdapters = suite.creditManager.adapters
      .values()
      .reduce<Record<Address, Address>>((acc, a) => {
        const contractLc = a.targetContract.toLowerCase() as Address;
        const adapterLc = a.address.toLowerCase() as Address;

        acc[contractLc] = adapterLc;

        return acc;
      }, {});

    const currentContractsData = Object.entries(
      contractsByNetwork[network],
    ).reduce<Record<SupportedContract, Address>>(
      (acc, [symbol, address]) => {
        if (!!address && address !== NOT_DEPLOYED) {
          acc[symbol as SupportedContract] = address.toLowerCase() as Address;
        }
        return acc;
      },
      {} as Record<SupportedContract, Address>,
    );

    const currentTokenData = Object.entries(tokenDataByNetwork[network]).reduce<
      Record<SupportedToken, Address>
    >(
      (acc, [symbol, address]) => {
        if (!!address && address !== NOT_DEPLOYED) {
          acc[symbol as SupportedToken] = address.toLowerCase() as Address;
        }
        return acc;
      },
      {} as Record<SupportedToken, Address>,
    );

    const { aura, convex, sky } = assets.reduce<{
      convex: Array<Asset>;
      aura: Array<Asset>;
      sky: Array<Asset>;
    }>(
      (acc, a) => {
        const symbol = getTokenSymbol_Legacy(a.token);
        if (isConvexStakedPhantomToken(symbol)) {
          acc.convex.push(a);
        } else if (isAuraStakedToken(symbol)) {
          acc.aura.push(a);
        } else if (isStakingRewardsPhantomToken(symbol)) {
          acc.sky.push(a);
        }
        return acc;
      },
      { convex: [], aura: [], sky: [] },
    );

    const getWithdrawCall = (pool: Address, a: Asset) => {
      return withdrawAll
        ? this.#withdrawAllAndUnwrap_Convex(pool, claim)
        : this.#withdrawAndUnwrap_Convex(pool, a.balance, claim);
    };

    const getWithdrawCall_Rewards = (pool: Address, a: Asset) => {
      const calls = [
        withdrawAll
          ? this.#withdrawAll_Rewards(pool)
          : this.#withdraw_Rewards(pool, a.balance),
        ...(claim ? [this.#claim_Rewards(pool)] : []),
      ];

      return calls;
    };

    const convexStkCalls = convex.map(a => {
      const symbol = getTokenSymbol_Legacy(a.token) as ConvexStakedPhantomToken;
      const info = convexTokens[symbol || ""] as ConvexPhantomTokenData;
      const poolAddress = currentContractsData[info?.pool || ""];

      if (!poolAddress) {
        throw new Error("Can't withdrawAllAndUnwrap_Convex (convex)");
      }
      const poolAddressLc = poolAddress.toLowerCase() as Address;

      return getWithdrawCall(cmAdapters[poolAddressLc], a);
    });

    const auraStkCalls = aura.map(a => {
      const symbol = getTokenSymbol_Legacy(a.token) as AuraStakedToken;
      const info = auraTokens[symbol || ""] as AuraStakedTokenData;
      const poolAddress = currentContractsData[info?.pool || ""];

      if (!poolAddress) {
        throw new Error("Can't withdrawAllAndUnwrap_Convex (aura)");
      }
      const poolAddressLc = poolAddress.toLowerCase() as Address;

      return getWithdrawCall(cmAdapters[poolAddressLc], a);
    });

    const skyStkCalls = sky.flatMap(a => {
      const symbol = getTokenSymbol_Legacy(
        a.token,
      ) as StakingRewardsPhantomToken;
      const info = stakingRewardsTokens[
        symbol || ""
      ] as StakingRewardsPhantomTokenData;
      const poolAddress = currentContractsData[info?.pool || ""];

      if (!poolAddress) {
        throw new Error("Can't withdrawAllAndUnwrap_Convex (sky)");
      }
      const poolAddressLc = poolAddress.toLowerCase() as Address;

      return getWithdrawCall_Rewards(cmAdapters[poolAddressLc], a);
    });

    const unwrapCalls = [...convexStkCalls, ...auraStkCalls, ...skyStkCalls];

    const withdraw = assets.map(a => {
      const symbol = getTokenSymbol_Legacy(a.token);
      if (isConvexStakedPhantomToken(symbol)) {
        return {
          ...a,
          token: currentTokenData[convexStakedPhantomTokens[symbol].underlying],
        };
      }
      if (isAuraStakedToken(symbol)) {
        return {
          ...a,
          token: currentTokenData[auraStakedTokens[symbol].underlying],
        };
      }
      if (isStakingRewardsPhantomToken(symbol)) {
        return {
          ...a,
          token: currentTokenData[stakingRewardsTokens[symbol].underlying],
        };
      }
      return a;
    });

    return { unwrapCalls, assetsToWithdraw: withdraw };
  }

  #withdrawAndUnwrap_Convex(
    address: Address,
    amount: bigint,
    claim: boolean,
  ): MultiCall {
    return {
      target: address,
      callData: encodeFunctionData({
        abi: parseAbi([
          "function withdrawAndUnwrap(uint256, bool claim) returns (uint256 tokensToEnable, uint256 tokensToDisable)",
        ]),
        functionName: "withdrawAndUnwrap",
        args: [amount, claim],
      }),
    };
  }
  #withdrawAllAndUnwrap_Convex(address: Address, claim: boolean): MultiCall {
    return {
      target: address,
      callData: encodeFunctionData({
        abi: parseAbi([
          "function withdrawDiffAndUnwrap(uint256 leftoverAmount, bool claim) returns (uint256 tokensToEnable, uint256 tokensToDisable)",
        ]),
        functionName: "withdrawDiffAndUnwrap",
        args: [1n, claim],
      }),
    };
  }
  #withdrawAll_Rewards(address: Address): MultiCall {
    return {
      target: address,
      callData: encodeFunctionData({
        abi: parseAbi([
          "function withdrawDiff(uint256 leftoverAmount) external returns (bool useSafePrices)",
        ]),
        functionName: "withdrawDiff",
        args: [1n],
      }),
    };
  }
  #withdraw_Rewards(address: Address, amount: bigint): MultiCall {
    return {
      target: address,
      callData: encodeFunctionData({
        abi: parseAbi([
          "function withdraw(uint256 amount) external returns (bool useSafePrices)",
        ]),
        functionName: "withdraw",
        args: [amount],
      }),
    };
  }
  #claim_Rewards(address: Address): MultiCall {
    return {
      target: address,
      callData: encodeFunctionData({
        abi: parseAbi([
          "function getReward() external returns (bool useSafePrices)",
        ]),
        functionName: "getReward",
        args: [],
      }),
    };
  }
}

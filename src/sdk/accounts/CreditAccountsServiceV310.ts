import { encodeFunctionData } from "viem";
import { iCreditFacadeMulticallV310Abi } from "../../abi/310/generated.js";
import { MAX_UINT256 } from "../constants/math.js";
import type { MultiCall } from "../types/index.js";
import { AbstractCreditAccountService } from "./AbstractCreditAccountsService.js";
import { PERMISSION_BY_TYPE } from "./constants.js";
import type {
  ClaimFarmRewardsProps,
  CreditAccountOperationResult,
  ICreditAccountsService,
  RepayAndLiquidateCreditAccountProps,
  RepayCreditAccountProps,
  SetBotProps,
  WithdrawCollateralProps,
} from "./types.js";

export class CreditAccountServiceV310
  extends AbstractCreditAccountService
  implements ICreditAccountsService
{
  /**
   * Implements {@link ICreditAccountsService.setBot}
   */
  public async setBot({
    botAddress,
    botBaseType,
    stopBot,

    creditAccount: ca,
  }: SetBotProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade({
      creditManager: ca.creditManager,
      creditAccount: ca,
    });

    const addBotCall: MultiCall = {
      target: ca.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        functionName: "setBotPermissions",
        args: [botAddress, stopBot ? 0n : PERMISSION_BY_TYPE[botBaseType]],
      }),
    };

    const calls = [...priceUpdatesCalls, addBotCall];

    const tx = cm.creditFacade.multicall(ca.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Implements {@link ICreditAccountsService.withdrawCollateral}
   */
  public async withdrawCollateral({
    creditAccount,
    assetsToWithdraw,
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

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
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
    assetsToWithdraw,
    creditAccount: ca,
    permits,
    to,
  }: RepayCreditAccountProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const router = this.sdk.routerFor(ca);
    const claimPath = await router.findClaimAllRewards({
      calls: [],
      creditAccount: ca,
    });

    const priceUpdates = await this.getPriceUpdatesForFacade({
      creditManager: ca.creditManager,
      creditAccount: ca,
    });

    const calls: Array<MultiCall> = [
      ...(operation === "close" ? [] : priceUpdates),
      ...this.prepareAddCollateral(ca.creditFacade, addCollateral, permits),
      ...this.prepareDisableQuotas(ca),
      ...this.prepareDecreaseDebt(ca),
      ...claimPath.calls,
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
    assetsToWithdraw,
    creditAccount: ca,
    permits,
    to,
  }: RepayAndLiquidateCreditAccountProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const router = this.sdk.routerFor(ca);
    const claimPath = await router.findClaimAllRewards({
      calls: [],
      creditAccount: ca,
    });

    const priceUpdates = await this.getPriceUpdatesForFacade({
      creditManager: ca.creditManager,
      creditAccount: ca,
    });

    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const calls: Array<MultiCall> = [
      ...priceUpdates,
      ...this.prepareAddCollateral(ca.creditFacade, addCollateral, permits),
      ...claimPath.calls,
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
    calls: legacyCalls,
    creditAccount: ca,

    minQuota,
    averageQuota,
  }: ClaimFarmRewardsProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const router = this.sdk.routerFor(ca);
    const claimPath = await router.findClaimAllRewards({
      calls: legacyCalls,
      creditAccount: ca,
    });
    if (claimPath.calls.length === 0) throw new Error("No path to execute");

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade({
      creditManager: ca.creditManager,
      creditAccount: ca,
      desiredQuotas: averageQuota,
    });

    const calls = [
      ...priceUpdatesCalls,
      ...claimPath.calls,
      ...this.prepareUpdateQuotas(ca.creditFacade, { minQuota, averageQuota }),
    ];

    const tx = cm.creditFacade.multicall(ca.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }
}

import { encodeFunctionData, getContract } from "viem";
import { iCreditFacadeMulticallV310Abi } from "../../abi/310/generated.js";
import { MAX_UINT256 } from "../constants/math.js";
import type { RouterRewardsResult } from "../router/types.js";
import type { MultiCall } from "../types/index.js";
import { AbstractCreditAccountService } from "./AbstractCreditAccountsService.js";
import type {
  ClaimFarmRewardsProps,
  CreditAccountOperationResult,
  CreditManagerOperationResult,
  ICreditAccountsService,
  LlamathenaProportionalWithdrawProps,
  PreviewWithdrawLlamathenaProportionallyProps,
  PreviewWithdrawLlamathenaProportionallyResult,
  RepayAndLiquidateCreditAccountProps,
  RepayCreditAccountProps,
  SetBotProps,
  WithdrawCollateralProps,
} from "./types.js";

/**
 * Service for querying and operating on Gearbox credit accounts.
 *
 * Provides methods to fetch account data, build transactions for common operations
 * (open, close, liquidate, swap, manage collateral/debt/quotas), and generate
 * the price feed updates required by the credit facade.
 *
 * @see {@link ICreditAccountsService}
 **/
export class CreditAccountServiceV310
  extends AbstractCreditAccountService
  implements ICreditAccountsService
{
  /**
   * {@inheritDoc ICreditAccountsService.setBot}
   */
  public async setBot({
    botAddress,
    permissions: defaultPermissions,

    targetContract,
  }: SetBotProps): Promise<
    CreditAccountOperationResult | CreditManagerOperationResult
  > {
    const cm = this.sdk.marketRegister.findCreditManager(
      targetContract.creditManager,
    );

    const permissions =
      defaultPermissions !== null
        ? defaultPermissions
        : await getContract({
            address: botAddress,
            client: this.sdk.client,
            abi: [
              {
                type: "function",
                name: "requiredPermissions",
                inputs: [],
                outputs: [
                  { name: "", type: "uint192", internalType: "uint192" },
                ],
                stateMutability: "view",
              },
            ],
          }).read.requiredPermissions();
    const addBotCall: MultiCall = {
      target: cm.creditFacade.address,
      callData: encodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        functionName: "setBotPermissions",
        args: [botAddress, permissions],
      }),
    };

    const calls =
      targetContract.type === "creditAccount"
        ? await this.prependPriceUpdates(
            targetContract.creditManager,
            [addBotCall],
            targetContract,
          )
        : [addBotCall];

    const tx =
      targetContract.type === "creditAccount"
        ? await this.multicallTx(cm, targetContract.creditAccount, calls)
        : undefined;

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.withdrawCollateral}
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

    const operationCalls: Array<MultiCall> = [
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

    const calls = await this.prependPriceUpdates(
      creditAccount.creditManager,
      operationCalls,
      creditAccount,
    );
    const tx = await this.multicallTx(cm, creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.repayCreditAccount}
   */
  async repayCreditAccount({
    operation,
    collateralAssets,
    assetsToWithdraw,
    creditAccount: ca,
    permits,
    to,
    tokensToClaim,
    calls: wrapCalls = [],
  }: RepayCreditAccountProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const router = this.sdk.routerFor(ca);

    const unwrapCalls =
      (await this.getRedeemDiffCalls(1n, ca.creditManager)) ?? [];

    const claimPath = await router.findClaimAllRewards({
      tokensToClaim,
      creditAccount: ca,
    });

    const operationCalls: Array<MultiCall> = [
      ...this.prepareAddCollateral(ca.creditFacade, addCollateral, permits),
      ...wrapCalls,
      ...this.prepareDisableQuotas(ca),
      ...this.prepareDecreaseDebt(ca),
      ...unwrapCalls,
      ...claimPath.calls,
      ...assetsToWithdraw.map(t =>
        this.prepareWithdrawToken(ca.creditFacade, t.token, MAX_UINT256, to),
      ),
    ];

    const calls =
      operation === "close"
        ? operationCalls
        : await this.prependPriceUpdates(ca.creditManager, operationCalls, ca);
    const tx = await this.closeCreditAccountTx(
      cm,
      ca.creditAccount,
      calls,
      operation,
    );

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.repayAndLiquidateCreditAccount}
   */
  async repayAndLiquidateCreditAccount({
    collateralAssets,
    assetsToWithdraw,
    creditAccount: ca,
    permits,
    to,
    tokensToClaim,
  }: RepayAndLiquidateCreditAccountProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const router = this.sdk.routerFor(ca);
    const claimPath = await router.findClaimAllRewards({
      tokensToClaim,
      creditAccount: ca,
    });

    const wrapCalls =
      (await this.getDepositDiffCalls(1n, ca.creditManager)) ?? [];

    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const operationCalls: Array<MultiCall> = [
      ...this.prepareAddCollateral(ca.creditFacade, addCollateral, permits),
      ...claimPath.calls,
      ...wrapCalls,
      ...assetsToWithdraw.map(t =>
        this.prepareWithdrawToken(ca.creditFacade, t.token, MAX_UINT256, to),
      ),
    ];

    const calls = await this.prependPriceUpdates(
      ca.creditManager,
      operationCalls,
      ca,
    );

    const tx = cm.creditFacade.liquidateCreditAccount(
      ca.creditAccount,
      to,
      calls,
    );
    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.claimFarmRewards}
   */
  async claimFarmRewards({
    calls: externalCalls,
    creditAccount: ca,

    minQuota,
    averageQuota,
    tokensToClaim,
  }: ClaimFarmRewardsProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const router = this.sdk.routerFor(ca);
    let claimPath: RouterRewardsResult;
    if (externalCalls) {
      claimPath = { calls: externalCalls };
    } else {
      claimPath = await router.findClaimAllRewards({
        tokensToClaim,
        creditAccount: ca,
      });
    }
    if (claimPath.calls.length === 0) throw new Error("No path to execute");

    const operationCalls = [
      ...claimPath.calls,
      ...this.prepareUpdateQuotas(ca.creditFacade, { minQuota, averageQuota }),
    ];

    const calls = await this.prependPriceUpdates(
      ca.creditManager,
      operationCalls,
      ca,
    );
    const tx = await this.multicallTx(cm, ca.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  async previewWithdrawLlamathenaProportionally(
    _: PreviewWithdrawLlamathenaProportionallyProps,
  ): Promise<PreviewWithdrawLlamathenaProportionallyResult> {
    throw new Error("Not implemented in v310");
  }
  async withdrawLlamathenaProportionally(
    _: LlamathenaProportionalWithdrawProps,
  ): Promise<CreditAccountOperationResult> {
    throw new Error("Not implemented in v310");
  }
}

import type { MultiCall } from "../types/transactions.js";
import { AbstractCreditAccountService } from "./AbstractCreditAccountsService.js";
import type {
  CreditAccountOperationResult,
  ICreditAccountsService,
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
  public setBot(_: SetBotProps): Promise<CreditAccountOperationResult> {
    throw new Error(
      "Not implemented in router v3.0. Try direct call setBotPermissions instead.",
    );
  }

  /**
   * Implements {@link ICreditAccountsService.withdrawCollateral}
   */
  public async withdrawCollateral({
    creditAccount,
    assetsToWithdraw: wrapped,
    to,

    minQuota,
    averageQuota,
  }: WithdrawCollateralProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      creditAccount.creditManager,
      creditAccount,
      undefined,
    );

    const { unwrapCalls, assetsToWithdraw } =
      this.prepareUnwrapAndWithdrawCallsV3(
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
}

import { AbstractCreditAccountService } from "./AbstractCreditAccountsService.js";
import type {
  CreditAccountOperationResult,
  ICreditAccountsService,
  SetBotProps,
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
}

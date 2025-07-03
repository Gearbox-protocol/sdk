import { encodeFunctionData } from "viem";
import { iCreditFacadeMulticallV310Abi } from "../../abi/v310.js";
import type { MultiCall } from "../types/index.js";
import { AbstractCreditAccountService } from "./AbstractCreditAccountsService.js";
import { PERMISSION_BY_TYPE } from "./constants.js";
import type {
  CreditAccountOperationResult,
  ICreditAccountsService,
  SetBotProps,
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
    averageQuota,
  }: SetBotProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      ca.creditManager,
      ca,
      averageQuota,
    );

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
}

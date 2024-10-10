import type { DecodeFunctionDataReturnType } from "viem";

import { creditFacadeV3Abi, iCreditFacadeV3MulticallAbi } from "../abi";
import { BaseContract, type CreditManagerData } from "../base";
import { ADDRESS_0X0 } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { CreditFacadeState } from "../state";
import { fmtBinaryMask } from "../utils";

type abi = typeof creditFacadeV3Abi;

export class CreditFacadeContract extends BaseContract<abi> {
  public readonly state: CreditFacadeState;

  constructor(
    sdk: GearboxSDK,
    { creditFacade, creditManager }: CreditManagerData,
  ) {
    super(sdk, {
      ...creditFacade.baseParams,
      name: `CreditFacadeV3(${creditManager.name})`,
      // Add multicall strictly for parsing, but use only creditFacadeV3Abi in types, so only this part is visible to typescript elsewhere
      abi: [...creditFacadeV3Abi, ...iCreditFacadeV3MulticallAbi] as any,
    });

    this.state = {
      ...this.contractData,
      maxQuotaMultiplier: Number(creditFacade.maxQuotaMultiplier),
      expirable: creditFacade.expirable,
      isDegenMode: creditFacade.degenNFT !== ADDRESS_0X0,
      degenNFT: creditFacade.degenNFT,
      expirationDate: Number(creditFacade.expirationDate),
      maxDebtPerBlockMultiplier: Number(creditFacade.maxDebtPerBlockMultiplier),
      botList: creditFacade.botList,
      minDebt: creditFacade.minDebt,
      maxDebt: creditFacade.maxDebt,
      currentCumulativeLoss: 0n,
      maxCumulativeLoss: 0n,
      forbiddenTokenMask: creditFacade.forbiddenTokenMask,
      isPaused: creditFacade.isPaused,
    };
  }

  public async getLastLiquidations(args?: {
    fromBlock?: bigint;
    toBlock?: bigint;
  }): Promise<string[]> {
    const lastLiquidation = 5n * 60n * 24n;
    const liquidationEvents =
      await this.contract.getEvents.LiquidateCreditAccount(
        {},
        {
          fromBlock: args?.fromBlock || this.sdk.currentBlock - lastLiquidation,
          toBlock: args?.toBlock || this.sdk.currentBlock,
        },
      );

    return liquidationEvents.map(event => event.transactionHash);
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): string[] | undefined {
    switch (params.functionName) {
      case "openCreditAccount": {
        const [onBehalfOf, calls, referralCode] = params.args;
        return [
          this.addressLabels.get(onBehalfOf),
          this.sdk.parseMultiCall([...calls]).join(","),
          `${referralCode}`,
        ];
      }
      case "closeCreditAccount": {
        const [creditAccount, calls] = params.args;
        return [
          this.addressLabels.get(creditAccount),
          this.sdk.parseMultiCall([...calls]).join(","),
        ];
      }
      case "liquidateCreditAccount": {
        const [creditAccount, to, calls] = params.args;
        return [
          this.addressLabels.get(creditAccount),
          this.addressLabels.get(to),
          this.sdk.parseMultiCall([...calls]).join(","),
        ];
      }
      case "setBotPermissions": {
        const [creditAccount, bot, permissions] = params.args;
        return [
          this.addressLabels.get(creditAccount),
          this.addressLabels.get(bot),
          fmtBinaryMask(permissions),
        ];
      }

      default:
        return undefined;
    }
  }
}

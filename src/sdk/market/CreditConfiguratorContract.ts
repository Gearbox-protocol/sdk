import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";

import { creditConfiguratorV3Abi } from "../abi";
import type { CreditManagerData } from "../base";
import { BaseContract } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { CreditConfiguratorState } from "../state";
import { formatDuration, percentFmt } from "../utils";

type abi = typeof creditConfiguratorV3Abi;

export class CreditConfiguratorContract extends BaseContract<abi> {
  public readonly adapters: Address[] = [];
  public readonly emergencyLiquidators: Address[] = [];

  constructor(
    sdk: GearboxSDK,
    { creditConfigurator, creditManager }: CreditManagerData,
    emergencyLiquidators: readonly Address[],
  ) {
    super(sdk, {
      ...creditConfigurator.baseParams,
      name: `CreditConfigurator(${creditManager.name})`,
      abi: creditConfiguratorV3Abi,
    });
    this.emergencyLiquidators = [...emergencyLiquidators];
  }

  public override processLog(
    log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      abi,
      ContractEventName<abi>
    >,
  ): void {
    switch (log.eventName) {
      case "AddCollateralToken":
      case "AddEmergencyLiquidator":
      case "AllowAdapter":
      case "AllowToken":
      case "CreditConfiguratorUpgraded":
      case "ForbidAdapter":
      case "ForbidToken":
      case "NewController":
      case "Paused":
      case "QuoteToken":
      case "RemoveEmergencyLiquidator":
      case "ResetCumulativeLoss":
      case "ScheduleTokenLiquidationThresholdRamp":
      case "SetBorrowingLimits":
      case "SetBotList":
      case "SetCreditFacade":
      case "SetExpirationDate":
      case "SetMaxCumulativeLoss":
      case "SetMaxDebtPerBlockMultiplier":
      case "SetMaxEnabledTokens":
      case "SetPriceOracle":
      case "SetTokenLiquidationThreshold":
      case "Unpaused":
      case "UpdateFees":
        this.dirty = true;
        break;
    }
  }

  public get state(): CreditConfiguratorState {
    return {
      ...this.contractData,
      emergencyLiquidators: this.emergencyLiquidators,
    };
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "addCollateralToken":
      case "setLiquidationThreshold": {
        const [token, lt] = params.args;
        return [this.addressLabels.get(token), percentFmt(lt)];
      }
      case "setExpirationDate": {
        const [expirationDate] = params.args;
        // TODO: add date format
        return [`${expirationDate}`];
      }
      case "setFees": {
        const [
          feeInterest,
          feeLiquidation,
          liquidationPremium,
          feeLiquidationExpired,
          liquidationPremiumExpired,
        ] = params.args;
        return [
          percentFmt(feeInterest),
          percentFmt(feeLiquidation),
          percentFmt(liquidationPremium),
          percentFmt(feeLiquidationExpired),
          percentFmt(liquidationPremiumExpired),
        ];
      }
      // case "setMinDebtLimit":
      // case "setMaxDebtLimit": {
      //   const [debt] = params.args;
      //   return [this.factory.convertUnderlying(debt)];
      // }
      case "setCreditFacade": {
        const [newCreditFacade, migrateParams] = params.args;
        return [this.addressLabels.get(newCreditFacade), `${migrateParams}`];
      }
      case "rampLiquidationThreshold": {
        const [token, liquidationThresholdFinal, rampStart, rampDuration] =
          params.args;
        return [
          this.addressLabels.get(token),
          percentFmt(liquidationThresholdFinal),
          `${rampStart}`,
          formatDuration(rampDuration),
        ];
      }

      default:
        return undefined;
    }
  }
}

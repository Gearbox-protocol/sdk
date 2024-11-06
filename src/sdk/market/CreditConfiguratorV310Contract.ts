import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";

import { iCreditConfiguratorV310Abi } from "../abi";
import type { CreditManagerData } from "../base";
import { BaseContract } from "../base";
import { RAMP_DURATION_BY_NETWORK } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import { formatDuration, percentFmt } from "../utils";
import type { RampEvent } from "./CreditConfiguratorV300Contract";

const abi = iCreditConfiguratorV310Abi;
type abi = typeof abi;

export class CreditConfiguratorV310Contract extends BaseContract<abi> {
  public readonly adapters: Address[] = [];
  public isPaused = false;

  constructor(
    sdk: GearboxSDK,
    { creditConfigurator, creditManager }: CreditManagerData,
  ) {
    super(sdk, {
      ...creditConfigurator.baseParams,
      name: `CreditConfigurator(${creditManager.name})`,
      abi,
    });
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
      case "RemoveEmergencyLiquidator":
      case "ScheduleTokenLiquidationThresholdRamp":
      case "SetBorrowingLimits":
      case "SetCreditFacade":
      case "SetExpirationDate":
      case "SetLossLiquidator":
      case "SetMaxDebtPerBlockMultiplier":
      case "SetPriceOracle":
      case "SetTokenLiquidationThreshold":
      case "UpdateFees":
        this.dirty = true;
    }
  }

  public async checkRamps(): Promise<RampEvent[]> {
    let fromBlock =
      this.sdk.currentBlock -
      RAMP_DURATION_BY_NETWORK[this.sdk.provider.networkType];
    fromBlock = fromBlock < 0n ? 0n : fromBlock;

    const logs = await this.provider.publicClient.getContractEvents({
      address: this.address,
      abi: this.abi,
      fromBlock,
      eventName: "ScheduleTokenLiquidationThresholdRamp",
      strict: true,
    });

    return logs.map(({ args }) => args);
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "addCollateralToken":
      case "setLiquidationThreshold": {
        const [token, lt] = params.args;
        return [this.labelAddress(token), percentFmt(lt)];
      }
      case "setExpirationDate": {
        const [expirationDate] = params.args;
        // TODO: add date format
        return [`${expirationDate}`];
      }
      case "setFees": {
        const [
          feeLiquidation,
          liquidationPremium,
          feeLiquidationExpired,
          liquidationPremiumExpired,
        ] = params.args;
        return [
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
        return [this.labelAddress(newCreditFacade), `${migrateParams}`];
      }
      case "rampLiquidationThreshold": {
        const [token, liquidationThresholdFinal, rampStart, rampDuration] =
          params.args;
        return [
          this.labelAddress(token),
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

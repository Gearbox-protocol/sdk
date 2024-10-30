import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  GetEventArgs,
  Log,
} from "viem";

import { creditConfiguratorV3Abi } from "../abi";
import type { CreditManagerData } from "../base";
import { BaseContract } from "../base";
import { RAMP_DURATION_BY_NETWORK } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import { formatDuration, percentFmt } from "../utils";

type abi = typeof creditConfiguratorV3Abi;

export type RampEvent = GetEventArgs<
  abi,
  "ScheduleTokenLiquidationThresholdRamp",
  {
    EnableUnion: false;
    IndexedOnly: false;
    Required: true;
  }
>;

export class CreditConfiguratorContract extends BaseContract<abi> {
  public readonly adapters: Address[] = [];
  public isPaused = false;

  constructor(
    sdk: GearboxSDK,
    { creditConfigurator, creditManager }: CreditManagerData,
  ) {
    super(sdk, {
      ...creditConfigurator.baseParams,
      name: `CreditConfigurator(${creditManager.name})`,
      abi: creditConfiguratorV3Abi,
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
      case "Paused":
        this.isPaused = true;
        break;
      case "Unpaused":
        this.isPaused = false;
        break;
      case "AddCollateralToken":
      case "AddEmergencyLiquidator":
      case "AllowAdapter":
      case "AllowToken":
      case "CreditConfiguratorUpgraded":
      case "ForbidAdapter":
      case "ForbidToken":
      case "NewController":
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
      case "UpdateFees":
        this.dirty = true;
        break;
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

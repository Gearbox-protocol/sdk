import type {
  ContractEventName,
  DecodeFunctionDataReturnType,
  GetEventArgs,
  Log,
} from "viem";

import { iPausableAbi } from "../../../abi/iPausable.js";
import { iCreditConfiguratorV300Abi } from "../../../abi/v300.js";
import type { CreditSuiteState } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import { RAMP_DURATION_BY_NETWORK } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { formatDuration, percentFmt } from "../../utils/index.js";
import type { ICreditConfiguratorContract } from "./types.js";

const abi = [...iCreditConfiguratorV300Abi, ...iPausableAbi] as const;
type abi = typeof abi;

export type RampEvent = GetEventArgs<
  abi,
  "ScheduleTokenLiquidationThresholdRamp",
  {
    EnableUnion: false;
    IndexedOnly: false;
    Required: true;
  }
>;

export class CreditConfiguratorV300Contract
  extends BaseContract<abi>
  implements ICreditConfiguratorContract
{
  public readonly sdk: GearboxSDK;
  public isPaused = false;

  constructor(
    sdk: GearboxSDK,
    { creditConfigurator, creditManager }: CreditSuiteState,
  ) {
    super(sdk, {
      ...creditConfigurator.baseParams,
      name: `CreditConfigurator(${creditManager.name})`,
      abi,
    });
    this.sdk = sdk;
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
      this.sdk.currentBlock - RAMP_DURATION_BY_NETWORK[this.sdk.networkType];
    fromBlock = fromBlock < 0n ? 0n : fromBlock;

    const logs = await this.client.getContractEvents({
      address: this.address,
      abi: this.abi,
      fromBlock,
      eventName: "ScheduleTokenLiquidationThresholdRamp",
      strict: true,
    });

    return logs.map(({ args }) => args);
  }

  protected override stringifyFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): string[] {
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
        return super.stringifyFunctionParams(params);
    }
  }
}

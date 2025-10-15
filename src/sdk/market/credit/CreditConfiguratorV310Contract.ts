import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";

import { iCreditConfiguratorV310Abi } from "../../../abi/310/generated.js";
import type { CreditSuiteState } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import { RAMP_DURATION_BY_NETWORK } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { formatDuration, percentFmt } from "../../utils/index.js";
import type { RampEvent } from "./CreditConfiguratorV300Contract.js";
import type { ICreditConfiguratorContract } from "./types.js";

const abi = iCreditConfiguratorV310Abi;
type abi = typeof abi;

export class CreditConfiguratorV310Contract
  extends BaseContract<abi>
  implements ICreditConfiguratorContract
{
  public readonly adapters: Address[] = [];
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
      case "AllowAdapter":
      case "AllowToken":
      case "CreditConfiguratorUpgraded":
      case "ForbidAdapter":
      case "ForbidToken":
      case "ScheduleTokenLiquidationThresholdRamp":
      case "SetBorrowingLimits":
      case "SetCreditFacade":
      case "SetExpirationDate":
      case "SetLossPolicy":
      case "SetMaxDebtPerBlockMultiplier":
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

  protected parseFunctionParams(
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

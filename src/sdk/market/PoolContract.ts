import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";

import { poolV3Abi } from "../abi";
import type { CreditManagerDebtParamsStruct, PoolData } from "../base";
import { BaseContract } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { PoolState } from "../state";
import { formatBN } from "../utils";

const abi = poolV3Abi;

export class PoolContract extends BaseContract<typeof abi> {
  state: PoolState;

  constructor(sdk: GearboxSDK, data: PoolData) {
    super(sdk, {
      ...data.baseParams,
      name: `PoolV3(${data.name})`,
      abi,
    });

    const creditManagerDebtParams: Record<
      Address,
      CreditManagerDebtParamsStruct
    > = data.creditManagerDebtParams.reduce(
      (acc, params) => {
        acc[params.creditManager.toLowerCase() as Address] =
          params as CreditManagerDebtParamsStruct;
        return acc;
      },
      {} as Record<Address, CreditManagerDebtParamsStruct>,
    );

    this.state = {
      ...data,
      ...this.contractData,
      lastBaseInterestUpdate: data.lastBaseInterestUpdate,
      underlying: data.underlying,
      decimals: sdk.marketRegister.tokensMeta.mustGet(data.underlying).decimals,
      creditManagerDebtParams,
      withdrawFee: Number(data.withdrawFee),
    };
  }

  public override processLog(
    log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      typeof abi,
      ContractEventName<typeof abi>
    >,
  ): void {
    switch (log.eventName) {
      // TODO: do we really mark all events?
      case "SetCreditManagerDebtLimit":
      case "Repay":
      case "Borrow":
      case "Deposit":
      case "Withdraw":
      case "SetTotalDebtLimit":
      case "SetWithdrawFee":
      case "AddCreditManager":
      case "Approval":
      case "EIP712DomainChanged":
      case "IncurUncoveredLoss":
      case "NewController":
      case "Paused":
      case "Refer":
      case "SetInterestRateModel":
      case "SetPoolQuotaKeeper":
      case "Transfer":
      case "Unpaused":
        this.dirty = true;
        break;
    }
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "deposit": {
        const [amount, onBehalfOf] = params.args;
        return [
          formatBN(amount, this.state.decimals),
          this.addressLabels.get(onBehalfOf),
        ];
      }
      default:
        return undefined;
    }
  }
}

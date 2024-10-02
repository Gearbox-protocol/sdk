import type { Address, DecodeFunctionDataReturnType, Log } from "viem";
import { parseEventLogs } from "viem";

import { poolV3Abi } from "../abi";
import type { CreditManagerDebtParamsStruct, PoolData } from "../base";
import { BaseContract } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { PoolState } from "../state";
import { formatBN } from "../utils";

const abi = poolV3Abi;

export class PoolContract extends BaseContract<typeof abi> {
  state: PoolState;

  // Contracts
  public hasOperation = false;

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

  public override parseLog(log: Log): void {
    const parsedLog = parseEventLogs({
      abi: this.abi,
      logs: [log],
    })[0];

    switch (parsedLog.eventName) {
      case "SetCreditManagerDebtLimit":
      case "Repay":
      case "Borrow":
      case "Deposit":
      case "Withdraw":
      case "SetTotalDebtLimit":
      case "SetWithdrawFee":
        this.hasOperation = true;
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

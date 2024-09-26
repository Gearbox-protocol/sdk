import { decimals, formatBN, getTokenSymbol } from "@gearbox-protocol/sdk-gov";
import type { Address, DecodeFunctionDataReturnType, Log } from "viem";
import { parseEventLogs } from "viem";

import type { Provider } from "../../deployer/Provider";
import { poolV3Abi } from "../../generated";
import { BaseContract } from "../base/BaseContract";
import type {
  CreditManagerDebtParamsStruct,
  MarketDataStruct,
} from "../base/types";
import type { PoolState } from "../state/poolState";

const abi = poolV3Abi;

export class PoolContract extends BaseContract<typeof abi> {
  state: PoolState;

  // Contracts
  hasOperation = false;

  public static attachMarket(
    marketData: MarketDataStruct,
    chainClient: Provider,
  ): PoolContract {
    const contract = new PoolContract({
      address: marketData.pool.baseParams.addr as Address,
      name: marketData.pool.name,
      chainClient,
    });

    const creditManagerDebtParams: Record<
      Address,
      CreditManagerDebtParamsStruct
    > = marketData.pool.creditManagerDebtParams.reduce(
      (acc, params) => {
        acc[params.creditManager.toLowerCase() as Address] =
          params as CreditManagerDebtParamsStruct;
        return acc;
      },
      {} as Record<Address, CreditManagerDebtParamsStruct>,
    );

    // TODO: avoid reading decimals from sdk-gov
    contract.state = {
      ...marketData.pool,
      contractType: marketData.pool.baseParams.contractType,
      lastBaseInterestUpdate: marketData.pool.lastBaseInterestUpdate,
      underlying: marketData.pool.underlying as Address,
      decimals:
        decimals[getTokenSymbol(marketData.pool.underlying as Address)!],
      creditManagerDebtParams,
      withdrawFee: Number(marketData.pool.withdrawFee),
      address: marketData.pool.baseParams.addr as Address,
      version: Number(marketData.baseParams.version),
    };

    return contract;
  }

  constructor(args: { address: Address; chainClient: Provider; name: string }) {
    super({
      ...args,
      name: `PoolV3(${args.name})`,
      abi,
    });
  }

  // LOGS

  protected parseLog(log: Log): void {
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

  parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "deposit":
        const [amount, onBehalfOf] = params.args;
        return [
          formatBN(amount, this.state.decimals),
          this.addressLabels.get(onBehalfOf),
        ];
      default:
        return undefined;
    }
  }
}

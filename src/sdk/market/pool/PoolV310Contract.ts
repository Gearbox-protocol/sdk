import type {
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";

import { iPausableAbi, iPoolV310Abi } from "../../abi";
import type { CreditManagerDebtParams, PoolData } from "../../base";
import { BaseContract } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { PoolStateHuman } from "../../types";
import { AddressMap, formatBN, formatBNvalue, percentFmt } from "../../utils";

const abi = [...iPoolV310Abi, ...iPausableAbi] as const;
type abi = typeof abi;

// Augmenting contract class with interface of compressor data object
export interface PoolV310Contract
  extends Omit<PoolData, "baseParams" | "creditManagerDebtParams">,
    BaseContract<abi> {}

export class PoolV310Contract extends BaseContract<abi> {
  public readonly creditManagerDebtParams: AddressMap<CreditManagerDebtParams>;

  constructor(sdk: GearboxSDK, data: PoolData) {
    const { baseParams, creditManagerDebtParams, ...rest } = data;
    super(sdk, {
      ...data.baseParams,
      name: `PoolV3(${data.name})`,
      abi,
    });
    Object.assign(this, rest);
    this.creditManagerDebtParams = new AddressMap(
      creditManagerDebtParams.map(p => [p.creditManager, p]),
    );
    // Put diesel token into tokens meta
    sdk.tokensMeta.upsert(data.baseParams.addr, {
      addr: data.baseParams.addr,
      decimals: data.decimals,
      name: data.name,
      symbol: data.symbol,
    });
  }

  public override stateHuman(raw = true): PoolStateHuman {
    return {
      ...super.stateHuman(raw),
      underlying: this.labelAddress(this.underlying),
      symbol: this.symbol,
      name: this.name,
      decimals: this.decimals,
      availableLiquidity: formatBNvalue(
        this.availableLiquidity,
        this.decimals,
        2,
        raw,
      ),
      expectedLiquidity: formatBNvalue(
        this.expectedLiquidity,
        this.decimals,
        2,
        raw,
      ),
      totalBorrowed: formatBNvalue(this.totalBorrowed, this.decimals, 2, raw),
      totalDebtLimit: formatBNvalue(this.totalDebtLimit, this.decimals, 2, raw),
      creditManagerDebtParams: Object.fromEntries(
        this.creditManagerDebtParams
          .values()
          .map(({ creditManager, borrowed, limit, available }) => [
            this.labelAddress(creditManager),
            {
              borrowed: formatBNvalue(borrowed, this.decimals, 2, raw),
              limit: formatBNvalue(limit, this.decimals, 2, raw),
              availableToBorrow: formatBNvalue(
                available,
                this.decimals,
                2,
                raw,
              ),
            },
          ]),
      ),
      totalSupply: formatBNvalue(this.totalSupply, this.decimals, 2, raw),
      supplyRate: `${formatBNvalue(this.supplyRate, 25, 2, raw)}%`,
      baseInterestIndex: `${formatBNvalue(this.totalSupply, 25, 2, raw)}%`,
      baseInterestRate: `${formatBNvalue(this.totalSupply, 25, 2, raw)}%`,
      withdrawFee: percentFmt(this.withdrawFee),
      lastBaseInterestUpdate: this.lastBaseInterestUpdate.toString(),
      baseInterestIndexLU: this.lastBaseInterestUpdate.toString(),
      isPaused: this.isPaused,
    };
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
      case "AddCreditManager":
      case "Approval":
      case "Borrow":
      case "Deposit":
      case "IncurUncoveredLoss":
      case "Refer":
      case "Repay":
      case "SetCreditManagerDebtLimit":
      case "SetInterestRateModel":
      case "SetPoolQuotaKeeper":
      case "SetTotalDebtLimit":
      case "SetWithdrawFee":
      case "Transfer":
      case "Withdraw":
        this.dirty = true;
        break;
    }
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "deposit": {
        const [amount, onBehalfOf] = params.args;
        return [formatBN(amount, this.decimals), this.labelAddress(onBehalfOf)];
      }
      default:
        return undefined;
    }
  }
}

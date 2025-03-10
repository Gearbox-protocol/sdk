import type {
  CurveParams,
  SupportedContract,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";
import { contractParams, formatBN } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import {
  iCurveV1_2AssetsAdapterAbi,
  iCurveV1_3AssetsAdapterAbi,
  iCurveV1_4AssetsAdapterAbi,
} from "../types";
import type { BigNumberish } from "../utils/formatter";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

export class CurveAdapterParser extends AbstractParser implements IParser {
  protected lpToken: SupportedToken;

  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);

    let contractName = "";

    const nCoins = (contractParams[contract] as CurveParams)?.tokens?.length;
    switch (nCoins) {
      case 2:
        this.abi = iCurveV1_2AssetsAdapterAbi;
        contractName = `Curve2AssetsAdapter`;
        break;
      case 3:
        this.abi = iCurveV1_3AssetsAdapterAbi;
        contractName = `Curve3AssetsAdapter`;
        break;
      case 4:
        this.abi = iCurveV1_4AssetsAdapterAbi;
        contractName = `Curve4AssetsAdapter`;
        break;
      default:
        throw new Error(`Unsupported curve contract ${contract}`);
    }
    this.lpToken = (contractParams[contract] as CurveParams).lpToken;
    if (!isContract) this.adapterName = contractName;
  }
  parse(calldata: Address): string {
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "exchange":
      case "exchange_underlying": {
        const [i, j, dx, min_dy] = functionData.args || [];

        const iSym =
          functionData.functionName === "exchange_underlying"
            ? this.getUnderlyingTokenByIndex(i)
            : this.getTokenByIndex(i);

        const jSym =
          functionData.functionName === "exchange_underlying"
            ? this.getUnderlyingTokenByIndex(j)
            : this.getTokenByIndex(j);

        return `${operationName}(i ,j: ${iSym} => ${jSym}, dx: ${this.formatBN(
          dx,
          iSym,
        )}, min_dy: ${this.formatBN(min_dy, jSym)})`;
      }

      case "exchange_diff":
      case "exchange_diff_underlying": {
        const [i, j, leftoverAmount, rateMinRAY] = functionData.args || [];

        const iSym =
          functionData.functionName === "exchange_diff_underlying"
            ? this.getUnderlyingTokenByIndex(i)
            : this.getTokenByIndex(i);

        const jSym =
          functionData.functionName === "exchange_diff_underlying"
            ? this.getUnderlyingTokenByIndex(j)
            : this.getTokenByIndex(j);

        return `${operationName}(i: ${iSym}, j: ${jSym}, leftoverAmount: ${this.formatBN(
          leftoverAmount,
          iSym,
        )}, rateMinRAY: ${formatBN(rateMinRAY, 27)}`;
      }

      case "add_liquidity_one_coin": {
        const [amount, i, minAmount] = functionData.args || [];

        const iSym = this.getTokenByIndex(i);

        return `${operationName}(amount: ${this.formatBN(
          amount,
          iSym,
        )}, i: ${iSym}, minAmount: ${this.formatBN(minAmount, this.lpToken)})`;
      }

      case "add_diff_liquidity_one_coin":
      case "remove_diff_liquidity_one_coin": {
        const [leftoverAmount, i, rateMinRAY] = functionData.args || [];

        return `${operationName}(leftoverAmount: ${this.formatBN(
          leftoverAmount,
          i,
        )}, i: ${this.getTokenByIndex(i)}, rateMinRAY: ${formatBN(
          rateMinRAY,
          27,
        )})`;
      }

      case "add_liquidity": {
        const [amounts, minAmount] = functionData.args || [];

        return `${operationName}(amounts: [${this.convertAmounts(
          amounts,
        )}], minAmount: ${this.formatBN(minAmount, this.lpToken)})`;
      }

      case "remove_liquidity": {
        const [amount, min_amounts] = functionData.args || [];

        return `${operationName}(amount: ${this.formatBN(
          amount,
          this.lpToken,
        )}, min_amounts: [${this.convertAmounts(min_amounts)}])`;
      }

      case "remove_liquidity_imbalance": {
        const [amounts, maxBurnAmount] = functionData.args || [];

        return `${operationName}(amounts: [${this.convertAmounts(
          amounts,
        )}], max_burn_amount: ${this.formatBN(maxBurnAmount, this.lpToken)})`;
      }

      case "remove_liquidity_one_coin": {
        const [amount, i, min_amount] = functionData.args || [];

        const iSym = this.getTokenByIndex(i);

        return `${operationName}(amount: ${this.formatBN(
          amount,
          this.lpToken,
        )},i: ${iSym}, min_amount: ${this.formatBN(min_amount, iSym)})`;
      }

      case "totalSupply": {
        return `${operationName}()`;
      }

      case "balances": {
        const [i] = functionData.args || [];
        return `${operationName}(${this.getTokenByIndex(i)})`;
      }
      case "balanceOf": {
        const [address] = functionData.args || [];
        return `${operationName}(${address})`;
      }
      case "get_virtual_price": {
        return `${operationName}()`;
      }

      case "allowance": {
        const [account, to] = functionData.args || [];
        return `${operationName}(account: ${account}, to: ${to})`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          operationName,
          calldata,
        );
    }
  }

  getTokenByIndex(index: number): SupportedToken {
    return (contractParams[this.contract as SupportedContract] as CurveParams)
      .tokens[index];
  }

  getUnderlyingTokenByIndex(index: number): SupportedToken {
    return (contractParams[this.contract as SupportedContract] as CurveParams)
      .underlyings![index];
  }

  convertAmounts(amounts: Array<BigNumberish>): string {
    return amounts
      .map((a, coin) => {
        const sym = this.getTokenByIndex(coin);
        return `${sym}: ${this.formatBN(a, sym)}`;
      })
      .join(", ");
  }
}

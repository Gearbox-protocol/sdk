import { BigNumberish } from "ethers";

import {
  contractParams,
  CurveParams,
  SupportedContract,
} from "../contracts/contracts";
import { SupportedToken } from "../tokens/token";
import {
  ICurveV1_2AssetsAdapter__factory,
  ICurveV1_3AssetsAdapter__factory,
  ICurveV1_4AssetsAdapter__factory,
} from "../types";
import { formatBN } from "../utils/formatter";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class CurveAdapterParser extends AbstractParser implements IParser {
  protected lpToken: SupportedToken;

  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);

    let contractName = "";

    const nCoins = (contractParams[contract] as CurveParams).tokens.length;
    switch (nCoins) {
      case 2:
        this.ifc = ICurveV1_2AssetsAdapter__factory.createInterface();
        contractName = `Curve2AssetsAdapter`;
        break;
      case 3:
        this.ifc = ICurveV1_3AssetsAdapter__factory.createInterface();
        contractName = `Curve3AssetsAdapter`;
        break;
      case 4:
        this.ifc = ICurveV1_4AssetsAdapter__factory.createInterface();
        contractName = `Curve4AssetsAdapter`;
        break;
      default:
        throw new Error(`Unsupported curve contract ${contract}`);
    }
    this.lpToken = (contractParams[contract] as CurveParams).lpToken;
    if (!isContract) this.adapterName = contractName;
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "exchange":
      case "exchange_underlying": {
        const [i, j, dx, min_dy] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );

        const iSym = this.getTokenByIndex(i);
        const jSym = this.getTokenByIndex(j);

        return `${functionName}(i ,j: ${iSym} => ${jSym}, dx: ${this.formatBN(
          dx,
          iSym,
        )}, min_dy: ${this.formatBN(min_dy, jSym)})`;
      }

      case "exchange_all":
      case "exchange_all_underlying": {
        const [i, j, rateMinRAY] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );

        return `${functionName}(i: ${this.getTokenByIndex(
          i,
        )}, j: ${this.getTokenByIndex(j)}, rateMinRAY: ${formatBN(
          rateMinRAY,
          27,
        )}`;
      }

      case "add_liquidity_one_coin": {
        const [amount, i, minAmount] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );

        const iSym = this.getTokenByIndex(i);

        return `${functionName}(amount: ${this.formatBN(
          amount,
          iSym,
        )}, i: ${iSym}, minAmount: ${this.formatBN(minAmount, this.lpToken)})`;
      }

      case "add_all_liquidity_one_coin":
      case "remove_all_liquidity_one_coin": {
        const [i, rateMinRAY] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );

        return `${functionName}(i: ${this.getTokenByIndex(
          i,
        )}, rateMinRAY: ${formatBN(rateMinRAY, 27)})`;
      }

      case "add_liquidity": {
        const [amounts, minAmount] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );

        return `${functionName}(amounts: [${this.convertAmounts(
          amounts,
        )}], minAmount: ${this.formatBN(minAmount, this.lpToken)})`;
      }

      case "remove_liquidity": {
        const [amount, min_amounts] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );

        return `${functionName}(amount: ${this.formatBN(
          amount,
          this.lpToken,
        )}, min_amounts: [${this.convertAmounts(min_amounts)}])`;
      }

      case "remove_liquidity_imbalance": {
        const [amounts, maxBurnAmount] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );

        return `${functionName}(amounts: [${this.convertAmounts(
          amounts,
        )}], max_burn_amount: ${this.formatBN(maxBurnAmount, this.lpToken)})`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }

  getTokenByIndex(index: number): SupportedToken {
    return (contractParams[this.contract as SupportedContract] as CurveParams)
      .tokens[index];
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

import { BigNumberish } from "ethers";
import {
  contractParams,
  contractsByNetwork,
  CurveParams,
  CurvePoolContract,
} from "../contracts/contracts";
import { ADDRESS_0X0, NetworkType } from "../core/constants";
import { CreditManagerData } from "../core/creditManager";
import { tokenDataByNetwork } from "../tokens/token";

import {
  CurveV1AdapterBase__factory,
  CurveV1Adapter2Assets__factory,
  CurveV1Adapter3Assets__factory,
  CurveV1Adapter4Assets__factory,
} from "../types";

import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
import { UniswapV2Multicaller } from "./uniswapV2";

export class CurveCalls {
  public static exchange(
    i: BigNumberish,
    j: BigNumberish,
    dx: BigNumberish,
    min_dy: BigNumberish,
  ) {
    return CurveV1AdapterBase__factory.createInterface().encodeFunctionData(
      "exchange",
      [i, j, dx, min_dy],
    );
  }

  public static exchange_all(
    i: BigNumberish,
    j: BigNumberish,
    rateMinRAY: BigNumberish,
  ) {
    return CurveV1AdapterBase__factory.createInterface().encodeFunctionData(
      "exchange_all",
      [i, j, rateMinRAY],
    );
  }

  public static exchange_underlying(
    i: BigNumberish,
    j: BigNumberish,
    dx: BigNumberish,
    min_dy: BigNumberish,
  ) {
    return CurveV1AdapterBase__factory.createInterface().encodeFunctionData(
      "exchange_underlying",
      [i, j, dx, min_dy],
    );
  }

  public static exchange_all_underlying(
    i: BigNumberish,
    j: BigNumberish,
    rateMinRAY: BigNumberish,
  ) {
    return CurveV1AdapterBase__factory.createInterface().encodeFunctionData(
      "exchange_all_underlying",
      [i, j, rateMinRAY],
    );
  }

  public static add_liquidity_one_coin(
    amount: BigNumberish,
    i: BigNumberish,
    minAmount: BigNumberish,
  ) {
    return CurveV1AdapterBase__factory.createInterface().encodeFunctionData(
      "add_liquidity_one_coin",
      [amount, i, minAmount],
    );
  }

  public static add_all_liquidity_one_coin(
    i: BigNumberish,
    rateMinRAY: BigNumberish,
  ) {
    return CurveV1AdapterBase__factory.createInterface().encodeFunctionData(
      "add_all_liquidity_one_coin",
      [i, rateMinRAY],
    );
  }

  public static remove_liquidity_one_coin(
    token_amount: BigNumberish,
    i: BigNumberish,
    min_amount: BigNumberish,
  ) {
    return CurveV1AdapterBase__factory.createInterface().encodeFunctionData(
      "remove_liquidity_one_coin",
      [token_amount, i, min_amount],
    );
  }

  public static remove_all_liquidity_one_coin(
    i: BigNumberish,
    minRateRAY: BigNumberish,
  ) {
    return CurveV1AdapterBase__factory.createInterface().encodeFunctionData(
      "remove_all_liquidity_one_coin",
      [i, minRateRAY],
    );
  }

  public static add_liquidity(
    amounts:
      | [BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
    min_mint_amount: BigNumberish,
  ): string {
    switch (amounts.length) {
      case 2:
        return CurveV1Adapter2Assets__factory.createInterface().encodeFunctionData(
          "add_liquidity",
          [amounts, min_mint_amount],
        );
      case 3:
        return CurveV1Adapter3Assets__factory.createInterface().encodeFunctionData(
          "add_liquidity",
          [amounts, min_mint_amount],
        );
      case 4:
        return CurveV1Adapter4Assets__factory.createInterface().encodeFunctionData(
          "add_liquidity",
          [amounts, min_mint_amount],
        );
      default:
        throw new Error("Wrong calls number: add_liquidity");
    }
  }

  public static remove_liquidity(
    amount: BigNumberish,
    min_amounts:
      | [BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
  ) {
    switch (min_amounts.length) {
      case 2:
        return CurveV1Adapter2Assets__factory.createInterface().encodeFunctionData(
          "remove_liquidity",
          [amount, min_amounts],
        );
      case 3:
        return CurveV1Adapter3Assets__factory.createInterface().encodeFunctionData(
          "remove_liquidity",
          [amount, min_amounts],
        );
      case 4:
        return CurveV1Adapter4Assets__factory.createInterface().encodeFunctionData(
          "remove_liquidity",
          [amount, min_amounts],
        );
      default:
        throw new Error("Wrong calls number: remove_liquidity");
    }
  }

  public static remove_liquidity_imbalance(
    amounts:
      | [BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
    max_burn_amount: BigNumberish,
  ) {
    switch (amounts.length) {
      case 2:
        return CurveV1Adapter2Assets__factory.createInterface().encodeFunctionData(
          "remove_liquidity_imbalance",
          [amounts, max_burn_amount],
        );
      case 3:
        return CurveV1Adapter3Assets__factory.createInterface().encodeFunctionData(
          "remove_liquidity_imbalance",
          [amounts, max_burn_amount],
        );
      case 4:
        return CurveV1Adapter4Assets__factory.createInterface().encodeFunctionData(
          "remove_liquidity_imbalance",
          [amounts, max_burn_amount],
        );
      default:
        throw new Error("Wrong calls number: remove_liquidity_imbalance");
    }
  }
}

export class CurveMulticaller {
  private readonly _address: string;

  constructor(address: string) {
    this._address = address;
  }

  static connect(address: string) {
    return new CurveMulticaller(address);
  }

  exchange(
    i: BigNumberish,
    j: BigNumberish,
    dx: BigNumberish,
    min_dy: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CurveCalls.exchange(i, j, dx, min_dy),
    };
  }

  exchange_all(
    i: BigNumberish,
    j: BigNumberish,
    rateMinRAY: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CurveCalls.exchange_all(i, j, rateMinRAY),
    };
  }

  exchange_underlying(
    i: BigNumberish,
    j: BigNumberish,
    dx: BigNumberish,
    min_dy: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CurveCalls.exchange_underlying(i, j, dx, min_dy),
    };
  }

  exchange_all_underlying(
    i: BigNumberish,
    j: BigNumberish,
    rateMinRAY: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CurveCalls.exchange_all_underlying(i, j, rateMinRAY),
    };
  }

  add_liquidity_one_coin(
    amount: BigNumberish,
    i: BigNumberish,
    minAmount: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CurveCalls.add_liquidity_one_coin(amount, i, minAmount),
    };
  }

  add_all_liquidity_one_coin(
    i: BigNumberish,
    rateMinRAY: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CurveCalls.add_all_liquidity_one_coin(i, rateMinRAY),
    };
  }

  remove_liquidity_one_coin(
    token_amount: BigNumberish,
    i: BigNumberish,
    min_amount: BigNumberish,
  ) {
    return {
      target: this._address,
      callData: CurveCalls.remove_liquidity_one_coin(
        token_amount,
        i,
        min_amount,
      ),
    };
  }

  remove_all_liquidity_one_coin(i: BigNumberish, minRateRAY: BigNumberish) {
    return {
      target: this._address,
      callData: CurveCalls.remove_all_liquidity_one_coin(i, minRateRAY),
    };
  }

  add_liquidity(
    amounts:
      | [BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
    min_mint_amount: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CurveCalls.add_liquidity(amounts, min_mint_amount),
    };
  }

  remove_liquidity(
    amount: BigNumberish,
    min_amounts:
      | [BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CurveCalls.remove_liquidity(amount, min_amounts),
    };
  }

  remove_liquidity_imbalance(
    amounts:
      | [BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish]
      | [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
    max_burn_amount: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CurveCalls.remove_liquidity_imbalance(amounts, max_burn_amount),
    };
  }
}

export class CurveStrategies {
  static underlyingToCurveLP(
    data: CreditManagerData,
    network: NetworkType,
    curvePool: CurvePoolContract,
    underlyingAmount: BigNumberish,
  ): MultiCallStruct[] {
    const calls: Array<MultiCallStruct> = [];
    const curveParams = contractParams[curvePool] as CurveParams;
    const tokenToDeposit = curveParams.tokens[0];

    if (
      data.underlyingToken.toLowerCase() !==
      tokenDataByNetwork[network][tokenToDeposit].toLowerCase()
    ) {
      calls.push(
        UniswapV2Multicaller.connect(
          data.adapters[
            contractsByNetwork[network].UNISWAP_V2_ROUTER.toLowerCase()
          ],
        ).swapExactTokensForTokens(
          underlyingAmount,
          0,
          [data.underlyingToken, tokenDataByNetwork[network][tokenToDeposit]],
          ADDRESS_0X0,
          Math.floor(new Date().getTime() / 1000) + 3600,
        ),
        CurveMulticaller.connect(
          data.adapters[contractsByNetwork[network][curvePool].toLowerCase()],
        ).add_all_liquidity_one_coin(0, 0),
      );
    } else {
      calls.push(
        CurveMulticaller.connect(
          data.adapters[contractsByNetwork[network][curvePool].toLowerCase()],
        ).add_liquidity_one_coin(underlyingAmount, 0, 0),
      );
    }

    return calls;
  }

  static curveLPToUnderlying(
    data: CreditManagerData,
    network: NetworkType,
    curvePool: CurvePoolContract,
    curveLPAmount: BigNumberish,
  ): MultiCallStruct[] {
    const calls: Array<MultiCallStruct> = [];
    const curveParams = contractParams[curvePool] as CurveParams;

    let curveContractAddress;

    if (curveParams.wrapper) {
      curveContractAddress =
        data.adapters[
          contractsByNetwork[network][curveParams.wrapper].toLowerCase()
        ];
    } else {
      curveContractAddress =
        data.adapters[contractsByNetwork[network][curvePool].toLowerCase()];
    }

    calls.push(
      CurveMulticaller.connect(curveContractAddress).remove_liquidity_one_coin(
        curveLPAmount,
        0,
        0,
      ),
    );

    if (
      tokenDataByNetwork[network][curveParams.tokens[0]].toLowerCase() !==
      data.underlyingToken.toLowerCase()
    ) {
      calls.push(
        UniswapV2Multicaller.connect(
          data.adapters[
            contractsByNetwork[network].UNISWAP_V2_ROUTER.toLowerCase()
          ],
        ).swapAllTokensForTokens(
          0,
          [
            tokenDataByNetwork[network][curveParams.tokens[0]],
            data.underlyingToken,
          ],
          Math.floor(new Date().getTime() / 1000) + 3600,
        ),
      );
    }

    return calls;
  }

  static allCurveLPToUnderlying(
    data: CreditManagerData,
    network: NetworkType,
    curvePool: CurvePoolContract,
  ): MultiCallStruct[] {
    const calls: Array<MultiCallStruct> = [];
    const curveParams = contractParams[curvePool] as CurveParams;

    let curveContractAddress;

    if (curveParams.wrapper) {
      curveContractAddress =
        data.adapters[
          contractsByNetwork[network][curveParams.wrapper].toLowerCase()
        ];
    } else {
      curveContractAddress =
        data.adapters[contractsByNetwork[network][curvePool].toLowerCase()];
    }

    calls.push(
      CurveMulticaller.connect(
        curveContractAddress,
      ).remove_all_liquidity_one_coin(0, 0),
    );

    if (
      tokenDataByNetwork[network][curveParams.tokens[0]].toLowerCase() !==
      data.underlyingToken.toLowerCase()
    ) {
      calls.push(
        UniswapV2Multicaller.connect(
          data.adapters[
            contractsByNetwork[network].UNISWAP_V2_ROUTER.toLowerCase()
          ],
        ).swapAllTokensForTokens(
          0,
          [
            tokenDataByNetwork[network][curveParams.tokens[0]],
            data.underlyingToken,
          ],
          Math.floor(new Date().getTime() / 1000) + 3600,
        ),
      );
    }

    return calls;
  }
}

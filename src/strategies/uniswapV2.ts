import { BigNumberish } from "ethers";

import { IUniswapV2Adapter__factory } from "../types";
import { MultiCallStruct } from "../types/@gearbox-protocol/router/contracts/interfaces/IClosePathResolver";

export class UniswapV2Calls {
  public static swapExactTokensForTokens(
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    path: Array<string>,
    to: string,
    deadline: BigNumberish,
  ) {
    return IUniswapV2Adapter__factory.createInterface().encodeFunctionData(
      "swapExactTokensForTokens",
      [amountIn, amountOutMin, path, to, deadline],
    );
  }

  public static swapTokensForExactTokens(
    amountOut: BigNumberish,
    amountInMax: BigNumberish,
    path: Array<string>,
    to: string,
    deadline: BigNumberish,
  ) {
    return IUniswapV2Adapter__factory.createInterface().encodeFunctionData(
      "swapTokensForExactTokens",
      [amountOut, amountInMax, path, to, deadline],
    );
  }

  public static swapAllTokensForTokens(
    rateMinRAY: BigNumberish,
    path: Array<string>,
    deadline: BigNumberish,
  ) {
    return IUniswapV2Adapter__factory.createInterface().encodeFunctionData(
      "swapAllTokensForTokens",
      [rateMinRAY, path, deadline],
    );
  }
}

export class UniswapV2Multicaller {
  private readonly _address: string;

  constructor(address: string) {
    this._address = address;
  }

  static connect(address: string) {
    return new UniswapV2Multicaller(address);
  }

  swapExactTokensForTokens(
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    path: Array<string>,
    to: string,
    deadline: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: UniswapV2Calls.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        to,
        deadline,
      ),
    };
  }

  swapTokensForExactTokens(
    amountOut: BigNumberish,
    amountInMax: BigNumberish,
    path: Array<string>,
    to: string,
    deadline: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: UniswapV2Calls.swapExactTokensForTokens(
        amountOut,
        amountInMax,
        path,
        to,
        deadline,
      ),
    };
  }

  swapAllTokensForTokens(
    rateMinRAY: BigNumberish,
    path: Array<string>,
    deadline: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: UniswapV2Calls.swapAllTokensForTokens(
        rateMinRAY,
        path,
        deadline,
      ),
    };
  }
}

import {
  ISwapRouter,
  IUniswapV3Adapter,
  IUniswapV3Adapter__factory,
} from "../types";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";

export class UniswapV3Calls {
  public static exactInputSingle(
    params: ISwapRouter.ExactInputSingleParamsStructOutput,
  ) {
    return IUniswapV3Adapter__factory.createInterface().encodeFunctionData(
      "exactInputSingle",
      [params],
    );
  }

  public static exactAllInputSingle(
    params: IUniswapV3Adapter.ExactAllInputSingleParamsStructOutput,
  ) {
    return IUniswapV3Adapter__factory.createInterface().encodeFunctionData(
      "exactAllInputSingle",
      [params],
    );
  }

  public static exactInput(params: ISwapRouter.ExactInputParamsStructOutput) {
    return IUniswapV3Adapter__factory.createInterface().encodeFunctionData(
      "exactInput",
      [params],
    );
  }

  public static exactAllInput(
    params: IUniswapV3Adapter.ExactAllInputParamsStructOutput,
  ) {
    return IUniswapV3Adapter__factory.createInterface().encodeFunctionData(
      "exactAllInput",
      [params],
    );
  }

  public static exactOutputSingle(
    params: ISwapRouter.ExactOutputSingleParamsStructOutput,
  ) {
    return IUniswapV3Adapter__factory.createInterface().encodeFunctionData(
      "exactOutputSingle",
      [params],
    );
  }

  public static exactOutput(params: ISwapRouter.ExactOutputParamsStructOutput) {
    return IUniswapV3Adapter__factory.createInterface().encodeFunctionData(
      "exactOutput",
      [params],
    );
  }
}

export class UniswapV3Multicaller {
  private readonly _address: string;

  constructor(address: string) {
    this._address = address;
  }

  static connect(address: string) {
    return new UniswapV3Multicaller(address);
  }

  exactInputSingle(
    params: ISwapRouter.ExactInputSingleParamsStructOutput,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: UniswapV3Calls.exactInputSingle(params),
    };
  }

  exactAllInputSingle(
    params: IUniswapV3Adapter.ExactAllInputSingleParamsStructOutput,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: UniswapV3Calls.exactAllInputSingle(params),
    };
  }

  exactInput(
    params: ISwapRouter.ExactInputParamsStructOutput,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: UniswapV3Calls.exactInput(params),
    };
  }

  exactAllInput(
    params: IUniswapV3Adapter.ExactAllInputParamsStructOutput,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: UniswapV3Calls.exactAllInput(params),
    };
  }

  exactOutputSingle(
    params: ISwapRouter.ExactOutputSingleParamsStructOutput,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: UniswapV3Calls.exactOutputSingle(params),
    };
  }

  exactOutput(
    params: ISwapRouter.ExactOutputParamsStructOutput,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: UniswapV3Calls.exactOutput(params),
    };
  }
}

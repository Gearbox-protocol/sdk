import { ISwapRouter, IUniswapV3Adapter } from "../types/contracts/adapters/uniswap/UniswapV3.sol/UniswapV3Adapter";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
export declare class UniswapV3Calls {
    static exactInputSingle(params: ISwapRouter.ExactInputSingleParamsStructOutput): string;
    static exactAllInputSingle(params: IUniswapV3Adapter.ExactAllInputSingleParamsStructOutput): string;
    static exactInput(params: ISwapRouter.ExactInputParamsStructOutput): string;
    static exactAllInput(params: IUniswapV3Adapter.ExactAllInputParamsStructOutput): string;
    static exactOutputSingle(params: ISwapRouter.ExactOutputSingleParamsStructOutput): string;
    static exactOutput(params: ISwapRouter.ExactOutputParamsStructOutput): string;
}
export declare class UniswapV3Multicaller {
    private readonly _address;
    constructor(address: string);
    static connect(address: string): UniswapV3Multicaller;
    exactInputSingle(params: ISwapRouter.ExactInputSingleParamsStructOutput): MultiCallStruct;
    exactAllInputSingle(params: IUniswapV3Adapter.ExactAllInputSingleParamsStructOutput): MultiCallStruct;
    exactInput(params: ISwapRouter.ExactInputParamsStructOutput): MultiCallStruct;
    exactAllInput(params: IUniswapV3Adapter.ExactAllInputParamsStructOutput): MultiCallStruct;
    exactOutputSingle(params: ISwapRouter.ExactOutputSingleParamsStructOutput): MultiCallStruct;
    exactOutput(params: ISwapRouter.ExactOutputParamsStructOutput): MultiCallStruct;
}

import { BigNumberish } from "ethers";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
export declare class UniswapV2Calls {
    static swapExactTokensForTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: Array<string>, to: string, deadline: BigNumberish): string;
    static swapTokensForExactTokens(amountOut: BigNumberish, amountInMax: BigNumberish, path: Array<string>, to: string, deadline: BigNumberish): string;
    static swapAllTokensForTokens(rateMinRAY: BigNumberish, path: Array<string>, deadline: BigNumberish): string;
}
export declare class UniswapV2Multicaller {
    private readonly _address;
    constructor(address: string);
    swapExactTokensForTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: Array<string>, to: string, deadline: BigNumberish): MultiCallStruct;
    swapTokensForExactTokens(amountOut: BigNumberish, amountInMax: BigNumberish, path: Array<string>, to: string, deadline: BigNumberish): MultiCallStruct;
    swapAllTokensForTokens(rateMinRAY: BigNumberish, path: Array<string>, deadline: BigNumberish): MultiCallStruct;
}

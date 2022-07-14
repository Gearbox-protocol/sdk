import { BigNumberish } from "ethers";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
export declare class CurveCalls {
    static exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish): string;
    static exchange_all(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish): string;
    static exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish): string;
    static exchange_all_underlying(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish): string;
    static add_all_liquidity_one_coin(i: BigNumberish, rateMinRAY: BigNumberish): string;
    static remove_liquidity_one_coin(token_amount: BigNumberish, i: BigNumberish, min_amount: BigNumberish): string;
    static remove_all_liquidity_one_coin(i: BigNumberish, minRateRAY: BigNumberish): string;
    static add_liquidity(amounts: [BigNumberish, BigNumberish] | [
        BigNumberish,
        BigNumberish,
        BigNumberish
    ] | [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
    ], min_mint_amount: BigNumberish): string;
    static remove_liquidity(amount: BigNumberish, min_amounts: [BigNumberish, BigNumberish] | [
        BigNumberish,
        BigNumberish,
        BigNumberish
    ] | [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
    ]): string;
    static remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish] | [
        BigNumberish,
        BigNumberish,
        BigNumberish
    ] | [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
    ], max_burn_amount: BigNumberish): string;
}
export declare class CurveMulticaller {
    private readonly _address;
    constructor(address: string);
    exchange(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish): MultiCallStruct;
    exchange_all(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish): MultiCallStruct;
    exchange_underlying(i: BigNumberish, j: BigNumberish, dx: BigNumberish, min_dy: BigNumberish): MultiCallStruct;
    exchange_all_underlying(i: BigNumberish, j: BigNumberish, rateMinRAY: BigNumberish): MultiCallStruct;
    add_all_liquidity_one_coin(i: BigNumberish, rateMinRAY: BigNumberish): MultiCallStruct;
    remove_liquidity_one_coin(token_amount: BigNumberish, i: BigNumberish, min_amount: BigNumberish): {
        target: string;
        callData: string;
    };
    remove_all_liquidity_one_coin(i: BigNumberish, minRateRAY: BigNumberish): {
        target: string;
        callData: string;
    };
    add_liquidity(amounts: [BigNumberish, BigNumberish] | [
        BigNumberish,
        BigNumberish,
        BigNumberish
    ] | [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
    ], min_mint_amount: BigNumberish): MultiCallStruct;
    remove_liquidity(amount: BigNumberish, min_amounts: [BigNumberish, BigNumberish] | [
        BigNumberish,
        BigNumberish,
        BigNumberish
    ] | [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
    ]): MultiCallStruct;
    remove_liquidity_imbalance(amounts: [BigNumberish, BigNumberish] | [
        BigNumberish,
        BigNumberish,
        BigNumberish
    ] | [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
    ], max_burn_amount: BigNumberish): MultiCallStruct;
}

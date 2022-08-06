import { BigNumberish } from "ethers";
import { ConvexPoolContract } from "../contracts/contracts";
import { NetworkType } from "../core/constants";
import { CreditManagerData } from "../core/creditManager";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
export declare class ConvexBoosterCalls {
    static deposit(pid: BigNumberish, amount: BigNumberish, stake: boolean): string;
    static depositAll(pid: BigNumberish, stake: boolean): string;
    static withdraw(pid: BigNumberish, amount: BigNumberish): string;
    static withdrawAll(pid: BigNumberish): string;
}
export declare class ConvexPoolCalls {
    static stake(amount: BigNumberish): string;
    static stakeAll(): string;
    static withdraw(amount: BigNumberish, claim: boolean): string;
    static withdrawAll(claim: boolean): string;
    static withdrawAndUnwrap(amount: BigNumberish, claim: boolean): string;
    static withdrawAllAndUnwrap(claim: boolean): string;
}
export declare class ConvexClaimZapCalls {
    static claimRewards(rewardContracts: Array<string>, extraRewardContracts: Array<string>, tokenRewardContracts: Array<string>, tokenRewardTokens: Array<string>, depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish): string;
}
export declare class ConvexBoosterMulticaller {
    private readonly _address;
    constructor(address: string);
    static connect(address: string): ConvexBoosterMulticaller;
    deposit(pid: BigNumberish, amount: BigNumberish, stake: boolean): MultiCallStruct;
    depositAll(pid: BigNumberish, stake: boolean): MultiCallStruct;
    withdraw(pid: BigNumberish, amount: BigNumberish): MultiCallStruct;
    withdrawAll(pid: BigNumberish): MultiCallStruct;
}
export declare class ConvexPoolMulticaller {
    private readonly _address;
    constructor(address: string);
    static connect(address: string): ConvexPoolMulticaller;
    stake(amount: BigNumberish): MultiCallStruct;
    stakeAll(): MultiCallStruct;
    withdraw(amount: BigNumberish, claim: boolean): MultiCallStruct;
    withdrawAll(claim: boolean): MultiCallStruct;
    withdrawAndUnwrap(amount: BigNumberish, claim: boolean): MultiCallStruct;
    withdrawAllAndUnwrap(claim: boolean): {
        target: string;
        callData: string;
    };
}
export declare class ConvexClaimZapMulticaller {
    private readonly _address;
    constructor(address: string);
    static connect(address: string): ConvexClaimZapMulticaller;
    claimRewards(rewardContracts: Array<string>, extraRewardContracts: Array<string>, tokenRewardContracts: Array<string>, tokenRewardTokens: Array<string>, depositCrvMaxAmount: BigNumberish, minAmountOut: BigNumberish, depositCvxMaxAmount: BigNumberish, spendCvxAmount: BigNumberish, options: BigNumberish): MultiCallStruct;
}
export declare class ConvexStrategies {
    static underlyingToStakedConvex(data: CreditManagerData, network: NetworkType, convexPool: ConvexPoolContract, underlyingAmount: BigNumberish): MultiCallStruct[];
    static stakedConvexToUnderlying(data: CreditManagerData, network: NetworkType, convexPool: ConvexPoolContract, convexLpAmount: BigNumberish, sellRewards: boolean): MultiCallStruct[];
    static allStakedConvexToUnderlying(data: CreditManagerData, network: NetworkType, convexPool: ConvexPoolContract, sellRewards: boolean): MultiCallStruct[];
    static sellRewards(data: CreditManagerData, network: NetworkType, convexPool: ConvexPoolContract): MultiCallStruct[];
}

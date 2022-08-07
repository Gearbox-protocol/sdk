import { BigNumberish } from "ethers";
import { YearnVaultContract } from "../contracts/contracts";
import { NetworkType } from "../core/constants";
import { CreditManagerData } from "../core/creditManager";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
export declare class YearnV2Calls {
    static deposit(amount?: BigNumberish, recipient?: string): string;
    static withdraw(maxShares?: BigNumberish, recipient?: string, maxLoss?: BigNumberish): string;
}
export declare class YearnV2Multicaller {
    private readonly _address;
    constructor(address: string);
    static connect(address: string): YearnV2Multicaller;
    deposit(amount?: BigNumberish, recipient?: string): MultiCallStruct;
    withdraw(maxShares?: BigNumberish, recipient?: string, maxLoss?: BigNumberish): MultiCallStruct;
}
export declare class YearnV2Strategies {
    static underlyingToYearn(data: CreditManagerData, network: NetworkType, yearnVault: YearnVaultContract, underlyingAmount: BigNumberish): MultiCallStruct[];
    static yearnToUnderlying(data: CreditManagerData, network: NetworkType, yearnVault: YearnVaultContract, yearnSharesAmount: BigNumberish): MultiCallStruct[];
}

import { BigNumberish } from "ethers";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
export declare class YearnV2Calls {
    static deposit(amount?: BigNumberish, recipient?: string): string;
    static withdraw(maxShares?: BigNumberish, recipient?: string, maxLoss?: BigNumberish): string;
}
export declare class YearnV2Multicaller {
    private readonly _address;
    constructor(address: string);
    deposit(amount?: BigNumberish, recipient?: string): MultiCallStruct;
    withdraw(maxShares?: BigNumberish, recipient?: string, maxLoss?: BigNumberish): MultiCallStruct;
}

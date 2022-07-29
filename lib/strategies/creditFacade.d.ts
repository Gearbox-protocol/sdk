import { BigNumberish } from "ethers";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
export declare class CreditFacadeCalls {
    static addCollateral(onBehalfOf: string, token: string, amount: BigNumberish): string;
    static increaseDebt(amount: BigNumberish): string;
    static decreaseDebt(amount: BigNumberish): string;
    static revertIfBalanceLessThan(token: string, minBalance: BigNumberish): string;
}
export declare class CreditFacadeMulticaller {
    private readonly _address;
    constructor(address: string);
    static connect(address: string): CreditFacadeMulticaller;
    addCollateral(onBehalfOf: string, token: string, amount: BigNumberish): MultiCallStruct;
    increaseDebt(amount: BigNumberish): MultiCallStruct;
    decreaseDebt(amount: BigNumberish): MultiCallStruct;
    revertIfBalanceLessThan(token: string, minBalance: BigNumberish): MultiCallStruct;
}

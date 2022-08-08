import { BigNumberish } from "ethers";
import { CreditManagerData } from "../core/creditManager";
import { NetworkType } from "../core/constants";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
export declare class LidoCalls {
    static submit(amount: BigNumberish): string;
    static submitAll(): string;
}
export declare class LidoMulticaller {
    private readonly _address;
    constructor(address: string);
    static connect(address: string): LidoMulticaller;
    submit(amount: BigNumberish): MultiCallStruct;
    submitAll(): MultiCallStruct;
}
export declare class LidoStrategies {
    static mintSteth(data: CreditManagerData, network: NetworkType, underlyingAmount: BigNumberish): MultiCallStruct[];
}

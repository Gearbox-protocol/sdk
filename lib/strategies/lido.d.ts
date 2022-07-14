import { BigNumberish } from "ethers";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
export declare class LidoCalls {
    static submit(amount: BigNumberish): string;
    static submitAll(): string;
}
export declare class LidoMulticaller {
    private readonly _address;
    constructor(address: string);
    submit(amount: BigNumberish): MultiCallStruct;
    submitAll(): MultiCallStruct;
}

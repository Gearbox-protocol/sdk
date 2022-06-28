import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PriceFeedChecker, PriceFeedCheckerInterface } from "../../../contracts/oracles/PriceFeedChecker";
declare type PriceFeedCheckerConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class PriceFeedChecker__factory extends ContractFactory {
    constructor(...args: PriceFeedCheckerConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<PriceFeedChecker>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): PriceFeedChecker;
    connect(signer: Signer): PriceFeedChecker__factory;
    static readonly bytecode = "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220e708c37745e23ed727bddee8f5582c8a297237e7e90294bf57a4ced66c6e8e2464736f6c634300080a0033";
    static readonly abi: {
        inputs: never[];
        name: string;
        type: string;
    }[];
    static createInterface(): PriceFeedCheckerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): PriceFeedChecker;
}
export {};

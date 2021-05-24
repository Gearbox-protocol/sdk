import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MockPoolService } from "../MockPoolService";
export declare class MockPoolService__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_underlyingToken: string, overrides?: Overrides): Promise<MockPoolService>;
    getDeployTransaction(_underlyingToken: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): MockPoolService;
    connect(signer: Signer): MockPoolService__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): MockPoolService;
}

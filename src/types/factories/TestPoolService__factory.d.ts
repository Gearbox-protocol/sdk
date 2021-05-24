import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { TestPoolService } from "../TestPoolService";
export declare class TestPoolService__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressProvider: string, _underlyingToken: string, _dieselAddress: string, interestRateModelAddress: string, overrides?: Overrides): Promise<TestPoolService>;
    getDeployTransaction(addressProvider: string, _underlyingToken: string, _dieselAddress: string, interestRateModelAddress: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): TestPoolService;
    connect(signer: Signer): TestPoolService__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): TestPoolService;
}

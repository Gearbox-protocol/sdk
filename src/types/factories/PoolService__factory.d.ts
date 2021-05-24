import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { PoolService } from "../PoolService";
export declare class PoolService__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_addressProvider: string, _underlyingToken: string, _dieselAddress: string, _interestRateModelAddress: string, overrides?: Overrides): Promise<PoolService>;
    getDeployTransaction(_addressProvider: string, _underlyingToken: string, _dieselAddress: string, _interestRateModelAddress: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): PoolService;
    connect(signer: Signer): PoolService__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): PoolService;
}

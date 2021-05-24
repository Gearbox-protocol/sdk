import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ContractsRegister } from "../ContractsRegister";
export declare class ContractsRegister__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressProvider: string, overrides?: Overrides): Promise<ContractsRegister>;
    getDeployTransaction(addressProvider: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): ContractsRegister;
    connect(signer: Signer): ContractsRegister__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): ContractsRegister;
}

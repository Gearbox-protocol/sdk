import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CurveMock } from "../CurveMock";
export declare class CurveMock__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<CurveMock>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): CurveMock;
    connect(signer: Signer): CurveMock__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): CurveMock;
}

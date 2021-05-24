import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { UniswapRouterMock } from "../UniswapRouterMock";
export declare class UniswapRouterMock__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<UniswapRouterMock>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): UniswapRouterMock;
    connect(signer: Signer): UniswapRouterMock__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): UniswapRouterMock;
}

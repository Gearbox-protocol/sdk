import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { WETHMock } from "../WETHMock";
export declare class WETHMock__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<WETHMock>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): WETHMock;
    connect(signer: Signer): WETHMock__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): WETHMock;
}

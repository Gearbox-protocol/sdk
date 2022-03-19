import { Signer, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { TreasuryMock, TreasuryMockInterface } from "../TreasuryMock";
export declare class TreasuryMock__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<TreasuryMock>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): TreasuryMock;
    connect(signer: Signer): TreasuryMock__factory;
    static readonly bytecode = "0x6080604052348015600f57600080fd5b50607c8061001e6000396000f3fe6080604052366041577f8ffa785350fa6b5fee858c4ca63eff2704b9538ff446bd673c1f6c11fc7aca16346040518082815260200191505060405180910390a1005b600080fdfea264697066735822122048bb3be1b2a3e664038a0772cf9bc88f1cb61ee9e4a3cd6a4f729d9602de30cc64736f6c63430007060033";
    static readonly abi: ({
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        stateMutability?: undefined;
    } | {
        stateMutability: string;
        type: string;
        anonymous?: undefined;
        inputs?: undefined;
        name?: undefined;
    })[];
    static createInterface(): TreasuryMockInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): TreasuryMock;
}

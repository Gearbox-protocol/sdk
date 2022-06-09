import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { TreasuryMock, TreasuryMockInterface } from "../../../../../contracts/test/mocks/dao/TreasuryMock";
declare type TreasuryMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class TreasuryMock__factory extends ContractFactory {
    constructor(...args: TreasuryMockConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<TreasuryMock>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): TreasuryMock;
    connect(signer: Signer): TreasuryMock__factory;
    static readonly bytecode = "0x6080604052348015600f57600080fd5b5060788061001e6000396000f3fe608060405236603d576040513481527f8ffa785350fa6b5fee858c4ca63eff2704b9538ff446bd673c1f6c11fc7aca169060200160405180910390a1005b600080fdfea2646970667358221220da1021bbace714b34b7957c6fc8ec5740c4553811b42db6cfe5399433b2e02f764736f6c634300080a0033";
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
export {};

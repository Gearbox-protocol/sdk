import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DSTest, DSTestInterface } from "../../../../../contracts/test/lib/test.sol/DSTest";
declare type DSTestConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class DSTest__factory extends ContractFactory {
    constructor(...args: DSTestConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<DSTest>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): DSTest;
    connect(signer: Signer): DSTest__factory;
    static readonly bytecode = "0x60806040526000805460ff19166001179055348015601c57600080fd5b50609e8061002b6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c8063ba414fa6146037578063fa7626d414605c575b600080fd5b600054604890610100900460ff1681565b604051901515815260200160405180910390f35b60005460489060ff168156fea2646970667358221220eea14dca941e82eef7bded4a831d78332b679e9c12423e04d7acd4fde4fe6cdf64736f6c634300080a0033";
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
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): DSTestInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DSTest;
}
export {};

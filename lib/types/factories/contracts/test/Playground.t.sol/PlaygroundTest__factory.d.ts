import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PlaygroundTest, PlaygroundTestInterface } from "../../../../contracts/test/Playground.t.sol/PlaygroundTest";
declare type PlaygroundTestConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class PlaygroundTest__factory extends ContractFactory {
    constructor(...args: PlaygroundTestConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<PlaygroundTest>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): PlaygroundTest;
    connect(signer: Signer): PlaygroundTest__factory;
    static readonly bytecode = "0x60806040526000805461ff01600160b01b031916757109709ecfa91a80626ff3989d68f67f5b1dd12d0001179055600560015534801561003e57600080fd5b506101208061004e6000396000f3fe6080604052348015600f57600080fd5b506004361060465760003560e01c80630a9254e414604b5780639319393e14607e578063ba414fa61460b9578063fa7626d41460de575b600080fd5b607c60008052600260205260377fac33ff75c19e70fe83507db0d683fd3465c996598dc972688b7ace676c89077b55565b005b607c6001805460061790556000805260026020526115a97fac33ff75c19e70fe83507db0d683fd3465c996598dc972688b7ace676c89077b55565b60005460ca90610100900460ff1681565b604051901515815260200160405180910390f35b60005460ca9060ff168156fea2646970667358221220fe06d0b05d782a7d452d2c78962e347e45696f19f7aac5f0e5e4ed3ac6a1778d64736f6c634300080a0033";
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
    static createInterface(): PlaygroundTestInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): PlaygroundTest;
}
export {};

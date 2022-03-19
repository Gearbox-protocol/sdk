import { Signer, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ExecutorMock, ExecutorMockInterface } from "../ExecutorMock";
export declare class ExecutorMock__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ExecutorMock>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): ExecutorMock;
    connect(signer: Signer): ExecutorMock__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50600060018190555061018e806100286000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80633fa4f2451461004657806351ae2a67146100645780635524107714610098575b600080fd5b61004e6100da565b6040518082815260200191505060405180910390f35b61006c6100e0565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6100c4600480360360208110156100ae57600080fd5b8101908080359060200190929190505050610104565b6040518082815260200191505060405180910390f35b60015481565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160018190555060018201905091905056fea26469706673582212209fcb6bf63cde6c4d1b2301ba3eeda37c75eee3c199e47beac2ff6e18d82164c064736f6c63430007060033";
    static readonly abi: ({
        inputs: never[];
        stateMutability: string;
        type: string;
        name?: undefined;
        outputs?: undefined;
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): ExecutorMockInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ExecutorMock;
}

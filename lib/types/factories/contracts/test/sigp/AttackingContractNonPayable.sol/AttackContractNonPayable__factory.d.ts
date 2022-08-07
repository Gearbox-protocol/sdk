import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { AttackContractNonPayable, AttackContractNonPayableInterface } from "../../../../../contracts/test/sigp/AttackingContractNonPayable.sol/AttackContractNonPayable";
declare type AttackContractNonPayableConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class AttackContractNonPayable__factory extends ContractFactory {
    constructor(...args: AttackContractNonPayableConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<AttackContractNonPayable>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): AttackContractNonPayable;
    connect(signer: Signer): AttackContractNonPayable__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50600080546001600160a01b0319163317905561012c806100326000396000f3fe608060405260043610601c5760003560e01c80638da5cb5b1460a2575b60005473ffffffffffffffffffffffffffffffffffffffff16331460a0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f5265766572743a20455448207472616e7366657220626c6f636b656421000000604482015260640160405180910390fd5b005b34801560ad57600080fd5b5060005460cd9073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390f3fea2646970667358221220f16831e91347b2904da02ba96b52cba7f595f3424154199aa0c59781dc84d43864736f6c634300080a0033";
    static readonly abi: ({
        inputs: never[];
        stateMutability: string;
        type: string;
        name?: undefined;
        outputs?: undefined;
    } | {
        stateMutability: string;
        type: string;
        inputs?: undefined;
        name?: undefined;
        outputs?: undefined;
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
    })[];
    static createInterface(): AttackContractNonPayableInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): AttackContractNonPayable;
}
export {};

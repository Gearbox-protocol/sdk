import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DummyMulticallTarget, DummyMulticallTargetInterface } from "../../../../contracts/test/sigp/DummyMulticallTarget";
declare type DummyMulticallTargetConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class DummyMulticallTarget__factory extends ContractFactory {
    constructor(...args: DummyMulticallTargetConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<DummyMulticallTarget>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): DummyMulticallTarget;
    connect(signer: Signer): DummyMulticallTarget__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5061019d806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80635456bf1314610046578063ba2a8a681461005b578063c670f8641461006e575b600080fd5b61005961005436600461014e565b610081565b005b61005961006936600461014e565b6100b8565b61005961007c36600461014e565b61011e565b6040518181527f624fb00c2ce79f34cb543884c3af64816dce0f4cec3d32661959e49d488a7a93906020015b60405180910390a150565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600b60248201527f63616c6c206661696c6564000000000000000000000000000000000000000000604482015260640160405180910390fd5b6040518181527f46692c0e59ca9cd1ad8f984a9d11715ec83424398b7eed4e05c8ce84662415a8906020016100ad565b60006020828403121561016057600080fd5b503591905056fea26469706673582212208e75f679da4f4472325407ea6f86e057fa363b6922298cfeac5bf483d53787c364736f6c634300080a0033";
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
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): DummyMulticallTargetInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DummyMulticallTarget;
}
export {};

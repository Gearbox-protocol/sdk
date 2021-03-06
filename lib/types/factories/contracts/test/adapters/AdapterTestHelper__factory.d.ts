import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { AdapterTestHelper, AdapterTestHelperInterface } from "../../../../contracts/test/adapters/AdapterTestHelper";
declare type AdapterTestHelperConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class AdapterTestHelper__factory extends ContractFactory {
    constructor(...args: AdapterTestHelperConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<AdapterTestHelper>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): AdapterTestHelper;
    connect(signer: Signer): AdapterTestHelper__factory;
    static readonly bytecode = "0x60806040526000805460ff1916600190811790915580546001600160a01b031916737109709ecfa91a80626ff3989d68f67f5b1dd12d17905534801561004457600080fd5b506101b1806100546000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063c12c21c01161005b578063c12c21c01461010e578063df5144331461012e578063f9aa028a1461014e578063fa7626d41461016e57600080fd5b80632f7a1881146100825780636f307dc3146100cc578063ba414fa6146100ec575b600080fd5b6003546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020015b60405180910390f35b6006546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6000546100fe90610100900460ff1681565b60405190151581526020016100c3565b6002546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6005546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6004546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6000546100fe9060ff168156fea2646970667358221220c3b9fe9bf4d2693c3977626f7cf14b70a4e7bcc57c98518e8b0fa621a4b04e1e64736f6c634300080a0033";
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        anonymous?: undefined;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
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
    static createInterface(): AdapterTestHelperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): AdapterTestHelper;
}
export {};

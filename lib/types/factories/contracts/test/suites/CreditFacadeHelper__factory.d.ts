import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { CreditFacadeHelper, CreditFacadeHelperInterface } from "../../../../contracts/test/suites/CreditFacadeHelper";
declare type CreditFacadeHelperConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class CreditFacadeHelper__factory extends ContractFactory {
    constructor(...args: CreditFacadeHelperConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<CreditFacadeHelper>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): CreditFacadeHelper;
    connect(signer: Signer): CreditFacadeHelper__factory;
    static readonly bytecode = "0x60806040526000805461ff01600160b01b031916757109709ecfa91a80626ff3989d68f67f5b1dd12d000117905534801561003957600080fd5b506101b1806100496000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063c12c21c01161005b578063c12c21c01461010e578063df5144331461012e578063f9aa028a1461014e578063fa7626d41461016e57600080fd5b80632f7a1881146100825780636f307dc3146100cc578063ba414fa6146100ec575b600080fd5b6002546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020015b60405180910390f35b6005546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6000546100fe90610100900460ff1681565b60405190151581526020016100c3565b6001546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6004546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6003546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6000546100fe9060ff168156fea26469706673582212208b7d054f155b11cd8a9a7237b403c1a4f93e409317933f8140aaf9ecf023153f64736f6c634300080a0033";
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
    static createInterface(): CreditFacadeHelperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): CreditFacadeHelper;
}
export {};

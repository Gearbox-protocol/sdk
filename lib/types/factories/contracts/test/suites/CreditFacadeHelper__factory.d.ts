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
    static readonly bytecode = "0x60806040526000805461ff01600160b01b031916757109709ecfa91a80626ff3989d68f67f5b1dd12d000117905534801561003957600080fd5b506103b3806100496000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063c12c21c01161005b578063c12c21c014610104578063df51443314610124578063f9aa028a14610144578063fa7626d41461016457600080fd5b80632f7a1881146100825780636f307dc3146100cc578063ba414fa6146100ec575b600080fd5b6002546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020015b60405180910390f35b6005546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6100f4610171565b60405190151581526020016100c3565b6001546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6004546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6003546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6000546100f49060ff1681565b60008054610100900460ff16156101915750600054610100900460ff1690565b6000737109709ecfa91a80626ff3989d68f67f5b1dd12d3b156102cc5760408051737109709ecfa91a80626ff3989d68f67f5b1dd12d602082018190527f6661696c6564000000000000000000000000000000000000000000000000000082840152825180830384018152606083019093526000929091610236917f667f9d70ca411d70ead50d8d5c22070dafc36ad75f3dcf5e7237b22ade9aecc49160800161030c565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529082905261026e91610348565b6000604051808303816000865af19150503d80600081146102ab576040519150601f19603f3d011682016040523d82523d6000602084013e6102b0565b606091505b50915050808060200190518101906102c8919061035b565b9150505b919050565b6000815160005b818110156102f257602081850181015186830152016102d8565b81811115610301576000828601525b509290920192915050565b7fffffffff0000000000000000000000000000000000000000000000000000000083168152600061034060048301846102d1565b949350505050565b600061035482846102d1565b9392505050565b60006020828403121561036d57600080fd5b8151801515811461035457600080fdfea2646970667358221220b6d67693f4cd46410ef2bff9243e24c9e4e62dcc08e3a02f52704a0003bf6abb64736f6c634300080a0033";
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

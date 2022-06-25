import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ZeroPriceFeed, ZeroPriceFeedInterface } from "../../../contracts/oracles/ZeroPriceFeed";
declare type ZeroPriceFeedConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ZeroPriceFeed__factory extends ContractFactory {
    constructor(...args: ZeroPriceFeedConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ZeroPriceFeed>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): ZeroPriceFeed;
    connect(signer: Signer): ZeroPriceFeed__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b506102ed806100206000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c8063975c19ab1161005b578063975c19ab146101205780639a6fc8f514610138578063d62ada1114610182578063feaf968c1461018a57600080fd5b8063313ce5671461008d5780633fd0875f146100ac57806354fd4d50146100c15780637284e416146100d7575b600080fd5b610095600881565b60405160ff90911681526020015b60405180910390f35b6100b4600581565b6040516100a391906101d0565b6100c9600181565b6040519081526020016100a3565b6101136040518060400160405280600e81526020017f5a65726f2070726963656665656400000000000000000000000000000000000081525081565b6040516100a39190610211565b610128600081565b60405190151581526020016100a3565b61014b610146366004610284565b610196565b6040805169ffffffffffffffffffff968716815260208101959095528401929092526060830152909116608082015260a0016100a3565b610128600181565b6001600042808361014b565b60008060008060006040517f24e46f7000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b602081016006831061020b577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b91905290565b600060208083528351808285015260005b8181101561023e57858101830151858201604001528201610222565b81811115610250576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b60006020828403121561029657600080fd5b813569ffffffffffffffffffff811681146102b057600080fd5b939250505056fea2646970667358221220d5e9d60bf947599ccc8338dfb9025b9f46960934f18c6d921b7cdc583333b22164736f6c634300080a0033";
    static readonly abi: ({
        inputs: never[];
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
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): ZeroPriceFeedInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ZeroPriceFeed;
}
export {};

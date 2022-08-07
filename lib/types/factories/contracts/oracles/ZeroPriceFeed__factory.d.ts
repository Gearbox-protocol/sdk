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
    static readonly bytecode = "0x608060405234801561001057600080fd5b506102da806100206000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c80637284e4161161005b5780637284e416146100cc5780639a6fc8f514610115578063d62ada111461015f578063feaf968c1461017757600080fd5b8063313ce567146100825780633fd0875f146100a157806354fd4d50146100b6575b600080fd5b61008a600881565b60405160ff90911681526020015b60405180910390f35b6100a9600581565b60405161009891906101bd565b6100be600181565b604051908152602001610098565b6101086040518060400160405280600e81526020017f5a65726f2070726963656665656400000000000000000000000000000000000081525081565b60405161009891906101fe565b610128610123366004610271565b610183565b6040805169ffffffffffffffffffff968716815260208101959095528401929092526060830152909116608082015260a001610098565b610167600181565b6040519015158152602001610098565b60016000428083610128565b60008060008060006040517f24e46f7000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60208101600683106101f8577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b91905290565b600060208083528351808285015260005b8181101561022b5785810183015185820160400152820161020f565b8181111561023d576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b60006020828403121561028357600080fd5b813569ffffffffffffffffffff8116811461029d57600080fd5b939250505056fea264697066735822122022d38108114e4b0f90bffdca6f01ae82a1ba53476258c2385aeda40a5af3500b64736f6c634300080a0033";
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

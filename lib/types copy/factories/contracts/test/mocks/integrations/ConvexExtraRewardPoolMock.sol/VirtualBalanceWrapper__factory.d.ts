import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { VirtualBalanceWrapper, VirtualBalanceWrapperInterface } from "../../../../../../contracts/test/mocks/integrations/ConvexExtraRewardPoolMock.sol/VirtualBalanceWrapper";
declare type VirtualBalanceWrapperConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class VirtualBalanceWrapper__factory extends ContractFactory {
    constructor(...args: VirtualBalanceWrapperConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<VirtualBalanceWrapper>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): VirtualBalanceWrapper;
    connect(signer: Signer): VirtualBalanceWrapper__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50610277806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806318160ddd14610046578063323a5e0b1461006157806370a08231146100a6575b600080fd5b61004e6100b9565b6040519081526020015b60405180910390f35b6000546100819073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610058565b61004e6100b43660046101eb565b610150565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610127573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061014b9190610228565b905090565b600080546040517f70a0823100000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8481166004830152909116906370a0823190602401602060405180830381865afa1580156101c1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101e59190610228565b92915050565b6000602082840312156101fd57600080fd5b813573ffffffffffffffffffffffffffffffffffffffff8116811461022157600080fd5b9392505050565b60006020828403121561023a57600080fd5b505191905056fea2646970667358221220a681f6bc7849399d7ea70dfd5562df02baf131430b72460e7e641869114e395f64736f6c634300080a0033";
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
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): VirtualBalanceWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): VirtualBalanceWrapper;
}
export {};

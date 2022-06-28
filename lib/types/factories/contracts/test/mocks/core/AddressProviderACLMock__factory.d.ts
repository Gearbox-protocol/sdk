import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { AddressProviderACLMock, AddressProviderACLMockInterface } from "../../../../../contracts/test/mocks/core/AddressProviderACLMock";
declare type AddressProviderACLMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class AddressProviderACLMock__factory extends ContractFactory {
    constructor(...args: AddressProviderACLMockConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<AddressProviderACLMock>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): AddressProviderACLMock;
    connect(signer: Signer): AddressProviderACLMock__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50600080546001600160a01b03191630178155338152600160208190526040909120805460ff191690911790556101208061004c6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c8063087376951460375780635f259aba146080575b600080fd5b60005460569073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020015b60405180910390f35b60a0608b36600460af565b60016020526000908152604090205460ff1681565b60405190151581526020016077565b60006020828403121560c057600080fd5b813573ffffffffffffffffffffffffffffffffffffffff8116811460e357600080fd5b939250505056fea2646970667358221220c29c6206595be96f2c39f301b0cbb1dd44dddfb77c084bfb0896ed2157bdeb2164736f6c634300080a0033";
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
    static createInterface(): AddressProviderACLMockInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): AddressProviderACLMock;
}
export {};

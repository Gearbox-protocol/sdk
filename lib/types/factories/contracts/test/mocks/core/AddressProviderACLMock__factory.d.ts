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
    static readonly bytecode = "0x608060405234801561001057600080fd5b50600080546001600160a01b031990811630908117835560028054909216179055338152600160208190526040909120805460ff191690911790556102568061005a6000396000f3fe608060405234801561001057600080fd5b50600436106100675760003560e01c806376e112861161005057806376e11286146100e95780639dcb511a1461014c578063fca513a81461018257600080fd5b8063087376951461006c5780635f259aba146100b6575b600080fd5b60005461008c9073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020015b60405180910390f35b6100d96100c43660046101cb565b60016020526000908152604090205460ff1681565b60405190151581526020016100ad565b61014a6100f73660046101ed565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260036020526040902080547fffffffffffffffffffffffff00000000000000000000000000000000000000001691909216179055565b005b61008c61015a3660046101cb565b60036020526000908152604090205473ffffffffffffffffffffffffffffffffffffffff1681565b60025461008c9073ffffffffffffffffffffffffffffffffffffffff1681565b803573ffffffffffffffffffffffffffffffffffffffff811681146101c657600080fd5b919050565b6000602082840312156101dd57600080fd5b6101e6826101a2565b9392505050565b6000806040838503121561020057600080fd5b610209836101a2565b9150610217602084016101a2565b9050925092905056fea26469706673582212204291f208ba289dc45c65523845755f7f16fafcfe35cecba679ed1b9627e274ee64736f6c634300080a0033";
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

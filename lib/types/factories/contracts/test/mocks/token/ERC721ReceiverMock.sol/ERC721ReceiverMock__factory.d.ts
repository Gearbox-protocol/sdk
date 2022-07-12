import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ERC721ReceiverMock, ERC721ReceiverMockInterface } from "../../../../../../contracts/test/mocks/token/ERC721ReceiverMock.sol/ERC721ReceiverMock";
declare type ERC721ReceiverMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ERC721ReceiverMock__factory extends ContractFactory {
    constructor(...args: ERC721ReceiverMockConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ERC721ReceiverMock>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): ERC721ReceiverMock;
    connect(signer: Signer): ERC721ReceiverMock__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50610197806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063150b7a0214610030575b600080fd5b61006861003e3660046100c6565b7f150b7a020000000000000000000000000000000000000000000000000000000095945050505050565b6040517fffffffff00000000000000000000000000000000000000000000000000000000909116815260200160405180910390f35b803573ffffffffffffffffffffffffffffffffffffffff811681146100c157600080fd5b919050565b6000806000806000608086880312156100de57600080fd5b6100e78661009d565b94506100f56020870161009d565b935060408601359250606086013567ffffffffffffffff8082111561011957600080fd5b818801915088601f83011261012d57600080fd5b81358181111561013c57600080fd5b89602082850101111561014e57600080fd5b969995985093965060200194939250505056fea26469706673582212201040629f4a59bc5ad67311394a0e2bf0488c3b7fe2dba70c87d5f74b7c1098ad64736f6c634300080a0033";
    static readonly abi: {
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
    }[];
    static createInterface(): ERC721ReceiverMockInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ERC721ReceiverMock;
}
export {};

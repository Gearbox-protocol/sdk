import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { CreditManagerMockForPoolTest, CreditManagerMockForPoolTestInterface } from "../../../../../contracts/test/mocks/pool/CreditManagerMockForPoolTest";
declare type CreditManagerMockForPoolTestConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class CreditManagerMockForPoolTest__factory extends ContractFactory {
    constructor(...args: CreditManagerMockForPoolTestConstructorParams);
    deploy(_poolService: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<CreditManagerMockForPoolTest>;
    getDeployTransaction(_poolService: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): CreditManagerMockForPoolTest;
    connect(signer: Signer): CreditManagerMockForPoolTest__factory;
    static readonly bytecode = "0x6080604052600280546001600160a01b03191673c4375b7de8af5a38a93548eb8453a498222c4ff217905534801561003657600080fd5b5060405161046c38038061046c8339810160408190526100559161007a565b600080546001600160a01b0319166001600160a01b03929092169190911790556100aa565b60006020828403121561008c57600080fd5b81516001600160a01b03811681146100a357600080fd5b9392505050565b6103b3806100b96000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063bf28068b1161005b578063bf28068b1461010b578063c8cca9e514610120578063ca9505e414610175578063e958b7041461018857600080fd5b8063570a7af2146100825780636d0a1218146100cb5780636f307dc3146100eb575b600080fd5b6000546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390f35b6002546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b6001546100a29073ffffffffffffffffffffffffffffffffffffffff1681565b61011e610119366004610303565b6101b3565b005b61011e61012e36600461032f565b600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b61011e610183366004610351565b610243565b6100a261019636600461032f565b5060025473ffffffffffffffffffffffffffffffffffffffff1690565b6000546040517fbf28068b0000000000000000000000000000000000000000000000000000000081526004810184905273ffffffffffffffffffffffffffffffffffffffff83811660248301529091169063bf28068b90604401600060405180830381600087803b15801561022757600080fd5b505af115801561023b573d6000803e3d6000fd5b505050505050565b6000546040517fca9505e400000000000000000000000000000000000000000000000000000000815260048101859052602481018490526044810183905273ffffffffffffffffffffffffffffffffffffffff9091169063ca9505e490606401600060405180830381600087803b1580156102bd57600080fd5b505af11580156102d1573d6000803e3d6000fd5b50505050505050565b803573ffffffffffffffffffffffffffffffffffffffff811681146102fe57600080fd5b919050565b6000806040838503121561031657600080fd5b82359150610326602084016102da565b90509250929050565b60006020828403121561034157600080fd5b61034a826102da565b9392505050565b60008060006060848603121561036657600080fd5b50508135936020830135935060409092013591905056fea264697066735822122019b54494968a3fb8887fbe03bfbc904710a604e86fcd387977fcef1b79c198e064736f6c634300080a0033";
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
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
    static createInterface(): CreditManagerMockForPoolTestInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): CreditManagerMockForPoolTest;
}
export {};

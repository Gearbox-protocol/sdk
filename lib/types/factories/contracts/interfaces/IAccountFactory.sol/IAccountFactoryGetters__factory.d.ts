import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAccountFactoryGetters, IAccountFactoryGettersInterface } from "../../../../contracts/interfaces/IAccountFactory.sol/IAccountFactoryGetters";
export declare class IAccountFactoryGetters__factory {
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
    static createInterface(): IAccountFactoryGettersInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAccountFactoryGetters;
}

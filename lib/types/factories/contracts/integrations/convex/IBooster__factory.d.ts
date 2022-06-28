import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBooster, IBoosterInterface } from "../../../../contracts/integrations/convex/IBooster";
export declare class IBooster__factory {
    static readonly abi: ({
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
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): IBoosterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IBooster;
}

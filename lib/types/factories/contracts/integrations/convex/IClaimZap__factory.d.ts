import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IClaimZap, IClaimZapInterface } from "../../../../contracts/integrations/convex/IClaimZap";
export declare class IClaimZap__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
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
    })[];
    static createInterface(): IClaimZapInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IClaimZap;
}

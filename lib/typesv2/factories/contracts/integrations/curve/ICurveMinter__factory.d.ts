import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurveMinter, ICurveMinterInterface } from "../../../../contracts/integrations/curve/ICurveMinter";
export declare class ICurveMinter__factory {
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
    static createInterface(): ICurveMinterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveMinter;
}

import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IWETHGateway, IWETHGatewayInterface } from "../../../contracts/interfaces/IWETHGateway";
export declare class IWETHGateway__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): IWETHGatewayInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IWETHGateway;
}

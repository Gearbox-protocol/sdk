import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPoolServiceEvents, IPoolServiceEventsInterface } from "../../../../contracts/interfaces/IPoolService.sol/IPoolServiceEvents";
export declare class IPoolServiceEvents__factory {
    static readonly abi: {
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
    }[];
    static createInterface(): IPoolServiceEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPoolServiceEvents;
}

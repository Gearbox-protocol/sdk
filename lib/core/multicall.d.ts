import { BytesLike } from "ethers";
export interface MultiCall {
    target: string;
    callData: BytesLike;
}

import { BytesLike } from "ethers";

export interface MultiCall {
  targetContract: string;
  callData: BytesLike;
}

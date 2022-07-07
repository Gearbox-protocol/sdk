import { BigNumberish } from "ethers";
import { CreditAccountDataStructOutput } from "../typesV2/contracts/interfaces/IDataCompressor.sol/IDataCompressor";
export interface TokenBalancePayload {
    token: string;
    balance: BigNumberish;
    isAllowed: boolean;
}
export declare type CreditAccountDataPayload = CreditAccountDataStructOutput;
export declare type CreditAccountDataExtendedPayload = CreditAccountDataStructOutput;

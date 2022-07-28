import { TokenData } from "../tokens/tokenData";
import type { TxSerialized } from "./transactions";
export interface Display {
    toString(tokenData: Record<string, TokenData>): string;
}
export declare type TxStatus = "pending" | "success" | "reverted";
export interface EventOrTxProps {
    block: number;
    txHash: string;
    txStatus: TxStatus;
    timestamp: number;
}
export declare abstract class EventOrTx implements Display {
    block: number;
    readonly txHash: string;
    readonly timestamp: number;
    protected _txStatus: TxStatus;
    constructor({ block, txHash, txStatus, timestamp }: EventOrTxProps);
    get isPending(): boolean;
    get txStatus(): TxStatus;
    compare(item: EventOrTx): number;
    abstract toString(tokenData: Record<string, TokenData>): string;
}
export declare type EVMEventProps = Omit<EventOrTxProps, "txStatus">;
export declare abstract class EVMEvent extends EventOrTx {
    constructor(opts: EVMEventProps);
}
declare type OptionalFields = "block" | "txStatus";
export declare type EVMTxProps = Omit<EventOrTxProps, OptionalFields> & Partial<Pick<EventOrTxProps, OptionalFields>>;
export declare abstract class EVMTx extends EventOrTx {
    constructor({ txHash, block, txStatus, timestamp }: EVMTxProps);
    abstract serialize(): TxSerialized;
    revert(block: number): void;
    success(block: number): void;
}
export {};

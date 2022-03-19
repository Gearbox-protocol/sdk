export declare class OperationData {
    readonly id: number;
    readonly address: string;
    readonly txHash: string;
    readonly blockNum: number;
    readonly operation: string;
    readonly timestamp: number;
    readonly date: string;
    constructor(payload: OperationDataPayload);
}
export interface OperationDataPayload {
    id: number;
    address: string;
    txHash: string;
    blockNum: number;
    operation: string;
    timestamp: number;
}
export interface OperationsList {
    id: string;
    data: Array<OperationData>;
}

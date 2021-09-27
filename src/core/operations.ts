import moment from "moment";

export class OperationData {
  public readonly id: number;
  public readonly address: string;
  public readonly txHash: string;
  public readonly blockNum: number;
  public readonly operation: string;
  public readonly timestamp: number;
  public readonly date: string;

  constructor(payload: OperationDataPayload) {
    this.id = payload.id;
    this.address = payload.address;
    this.txHash = payload.txHash;
    this.blockNum = payload.blockNum;
    this.operation = payload.operation;
    this.timestamp = payload.timestamp;
    this.date = moment(payload.timestamp * 1000).format("Do MMM YYYY");
  }
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

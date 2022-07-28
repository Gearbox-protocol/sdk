export interface CreditOperation {
  id: number;
  txHash: string;
  blockNum: number;
  protocol: string;
  operation: string;
  timestamp: number;
  date: string;
}

import { unix } from "moment";

import { getContractName } from "../../contracts/contractsRegister";
import { TokenData } from "../../tokens/tokenData";
import { formatBN } from "../../utils/formatter";

export interface BasePoolOperation {
  amount: string;
  pool: string;
  session_id: string;
  timestamp: number;
  tx_hash: string;
  user: string;
}

export abstract class AbstractPoolOperation {
  public readonly txHash: string;
  public readonly date: string;
  public readonly timestamp: number;
  public readonly user: string;
  public readonly sessionId: string;
  public readonly pool: string;
  public readonly amount: bigint;

  constructor(opts: BasePoolOperation) {
    this.txHash = opts.tx_hash;
    this.amount = BigInt(opts.amount);
    this.pool = opts.pool;
    this.sessionId = opts.session_id;
    this.user = opts.user;

    this.timestamp = opts.timestamp;
    this.date = unix(opts.timestamp).format("Do MMM YYYY");
  }

  public abstract toString(token: TokenData): string;
}

export type PoolOperationResponse = BasePoolOperation & {
  event: string;
};

export class PoolOperation extends AbstractPoolOperation {
  public readonly event: string;

  constructor(ops: PoolOperationResponse) {
    super(ops);
    this.event = ops.event;
  }

  toString(token: TokenData): string {
    return `${this.event} ${formatBN(
      this.amount,
      token.decimals,
    )} ${getContractName(this.pool)}`;
  }
}

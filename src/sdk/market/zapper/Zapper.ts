import type { Address } from "viem";
import type { ZapperData } from "../types.js";

export class Zapper implements ZapperData {
  public readonly pool: Address;
  public readonly type: "migration" | "rwa" | "base";
  public readonly baseParams: ZapperData["baseParams"];
  public readonly tokenIn: ZapperData["tokenIn"];
  public readonly tokenOut: ZapperData["tokenOut"];

  constructor(data: ZapperData) {
    this.pool = data.pool;
    this.type = data.type;
    this.baseParams = data.baseParams;
    this.tokenIn = data.tokenIn;
    this.tokenOut = data.tokenOut;
  }
}

import type { Address } from "viem";
import type { BaseParams } from "../../base/types.js";
import { bytes32ToString } from "../../utils/index.js";
import type { ZapperData } from "../types.js";

export class Zapper implements ZapperData {
  public readonly pool: Address;
  public readonly type: "migration" | "rwa" | "base";
  public readonly baseParams: ZapperData["baseParams"];
  public readonly tokenIn: ZapperData["tokenIn"];
  public readonly tokenOut: ZapperData["tokenOut"];
  public readonly contractType: string;

  constructor(data: ZapperData) {
    this.pool = data.pool;
    this.type = data.type;
    this.baseParams = data.baseParams;
    this.tokenIn = data.tokenIn;
    this.tokenOut = data.tokenOut;
    this.contractType = Zapper.contractType(data.baseParams);
  }

  static contractType(baseParams: BaseParams): string {
    return bytes32ToString(baseParams.contractType);
  }
}

import { Hex } from "viem";
import { Address } from "viem";
import { iPoolConfigureActionsAbi } from "../../abi";

import { AbstractFactory } from "./abstract-factory";
import { SetTokenQuotaIncreaseFeeParams } from "../types";

const abi = iPoolConfigureActionsAbi;

export class PoolFactory extends AbstractFactory<typeof abi> {
  constructor() {
    super(abi);
  }

  pause(): Hex {
    return this.createCallData({
      functionName: "pause",
    });
  }

  unpause(): Hex {
    return this.createCallData({
      functionName: "unpause",
    });
  }

  setCreditManagerDebtLimit(args: {
    creditManager: Address;
    limit: bigint;
  }): Hex {
    return this.createCallData({
      functionName: "setCreditManagerDebtLimit",
      args: [args.creditManager, args.limit],
    });
  }

  setTokenLimit(args: { token: Address; limit: bigint }): Hex {
    return this.createCallData({
      functionName: "setTokenLimit",
      args: [args.token, args.limit],
    });
  }

  setTokenQuotaIncreaseFee(params: SetTokenQuotaIncreaseFeeParams): Hex {
    return this.createCallData({
      functionName: "setTokenQuotaIncreaseFee",
      args: [params.token, params.fee],
    });
  }

  setTotalDebtLimit(args: { limit: bigint }): Hex {
    return this.createCallData({
      functionName: "setTotalDebtLimit",
      args: [args.limit],
    });
  }
}

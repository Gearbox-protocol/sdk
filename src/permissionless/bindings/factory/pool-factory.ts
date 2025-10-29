import type { Address, Hex } from "viem";
import { iPoolConfigureActionsAbi } from "../../../abi/310/configure/iPoolConfigureActions.js";
import type { SetTokenQuotaIncreaseFeeParams } from "../types.js";
import { AbstractFactory } from "./abstract-factory.js";

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

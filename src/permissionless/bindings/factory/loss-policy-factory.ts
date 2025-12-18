import type { Hex } from "viem";
import { iLossPolicyV310Abi } from "../../../abi/310/generated.js";
import { AbstractFactory } from "./abstract-factory.js";

const abi = iLossPolicyV310Abi;

export enum AccessMode {
  Permissionless = 0,
  Permissioned = 1,
  Forbidden = 2,
}

export class LossPolicyFactory extends AbstractFactory<typeof abi> {
  constructor() {
    super(abi);
  }

  setAccessMode(args: { accessMode: AccessMode }): Hex {
    return this.createCallData({
      functionName: "setAccessMode",
      args: [args.accessMode],
    });
  }

  setChecksEnabled(args: { enabled: boolean }): Hex {
    return this.createCallData({
      functionName: "setChecksEnabled",
      args: [args.enabled],
    });
  }
}

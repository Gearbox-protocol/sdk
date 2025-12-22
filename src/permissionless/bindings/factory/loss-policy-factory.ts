import { decodeFunctionData, type Hex } from "viem";
import { iLossPolicyV310Abi } from "../../../abi/310/generated.js";
import { AccessMode } from "../types.js";
import { AbstractFactory } from "./abstract-factory.js";

const abi = iLossPolicyV310Abi;

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

  decodeConfig(
    calldata: Hex,
  ): { functionName: string; args: Record<string, string> } | null {
    const decoded = decodeFunctionData({
      abi: this.abi,
      data: calldata,
    });

    if (decoded.functionName === "setAccessMode") {
      const [accessMode] = decoded.args;

      return {
        functionName: decoded.functionName,
        args: {
          mode: AccessMode[accessMode] ?? accessMode,
        },
      };
    }

    return super.decodeConfig(calldata);
  }
}

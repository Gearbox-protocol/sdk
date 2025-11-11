import type { Address, DecodeFunctionDataReturnType, Hex, PublicClient } from "viem";
import { ITreasurySplitterAbi } from "../../abi/310/iTreasurySplitter.js";
import type { RawTx } from "../../sdk/types/index.js";
import type { ParsedCall } from "../core/index.js";
import { BaseContract } from "./base-contract.js";
import { decodeFunctionWithNamedArgs } from "../utils/abi-decoder.js";

const abi = ITreasurySplitterAbi;

export class TreasurySplitterContract extends BaseContract<typeof abi> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "TreasurySplitter");
  }

  async defaultSplit() {
    return await this.contract.read.defaultSplit();
  }

  async activeProposals() {
    return this.contract.read.activeProposals();
  }

  distribute(token: Address): RawTx {
    return this.createRawTx({
      functionName: "distribute",
      args: [token],
    });
  }

  setDefaultSplitTx(receivers: Address[], proportions: number[]): RawTx {
    const rawTx = this.createRawTx({
      functionName: "setDefaultSplit",
      args: [receivers, proportions],
    });
    return this.wrapConfigure(rawTx);
  }

  setTokenSplitTx(token: Address, receivers: Address[], proportions: number[], distributeBefore: boolean): RawTx {
    const rawTx = this.createRawTx({
      functionName: "setTokenSplit",
      args: [token, receivers, proportions, distributeBefore],
    });
    return this.wrapConfigure(rawTx);
  }

  setTokenInsuranceAmountTx(token: Address, amount: bigint): RawTx {
    const rawTx = this.createRawTx({
      functionName: "setTokenInsuranceAmount",
      args: [token, amount],
    });
    return this.wrapConfigure(rawTx);
  }

  withdrawTokenTx(token: Address, to: Address, amount: bigint): RawTx {
    const rawTx = this.createRawTx({
      functionName: "withdrawToken",
      args: [token, to, amount],
    });
    return this.wrapConfigure(rawTx);
  }

  configureTx(callData: Hex): RawTx {
    return this.createRawTx({
      functionName: "configure",
      args: [callData],
    });
  }

  cancelConfigureTx(callData: Hex): RawTx {
    const rawTx = this.createRawTx({
      functionName: "cancelConfigure",
      args: [callData],
    });
    return rawTx;
  }

  private wrapConfigure(rawTx: RawTx): RawTx {
    return this.createRawTx({
      functionName: "configure",
      args: [rawTx.callData],
    });
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCall | undefined {
    const { functionName, args } = params;

    switch (functionName) {
      case "distribute": {
        const [token] = args as [Address];
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            token,
          },
        };
      }

      case "configure": {
        const [callData] = args as [Hex];
        const decoded = decodeFunctionWithNamedArgs(abi, callData);
        if (decoded) {
          return {
            chainId: 0,
            target: this.address,
            label: this.name,
            functionName,
            args: {
              functionName: decoded.functionName,
              ...decoded.args,
            },
          };
        }
        return undefined;
      }

      default:
        return undefined;
    }
  }
}

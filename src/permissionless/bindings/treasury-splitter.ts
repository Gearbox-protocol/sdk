import {
  type Address,
  type Chain,
  type DecodeFunctionDataReturnType,
  decodeFunctionData,
  type Hex,
  type PublicClient,
  type Transport,
} from "viem";
import { ITreasurySplitterAbi } from "../../abi/310/iTreasurySplitter.js";
import type { ParsedCallArgs, RawTx } from "../../sdk/index.js";
import { BaseContract, json_stringify } from "../../sdk/index.js";

const abi = ITreasurySplitterAbi;

export class TreasurySplitterContract extends BaseContract<typeof abi> {
  constructor(addr: Address, client: PublicClient<Transport, Chain>) {
    super({ client }, { abi, addr, name: "TreasurySplitter" });
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

  setTokenSplitTx(
    token: Address,
    receivers: Address[],
    proportions: number[],
    distributeBefore: boolean,
  ): RawTx {
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

  protected override parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCallArgs {
    const { functionName, args } = params;

    switch (functionName) {
      case "configure": {
        const [callData] = args;
        const decoded = decodeFunctionData({
          abi,
          data: callData,
        });
        return {
          functionName: decoded.functionName,
          ...this.parseFunctionParams(decoded),
        };
      } case "setDefaultSplit": {
        const [receivers, proportions] = args;
        return {
          receivers: json_stringify(receivers),
          proportions: json_stringify(proportions.map((proportion) => `${proportion / 100}% [${proportion}]`))
          
          ,
        };
      }

      default:
        return super.parseFunctionParams(params);
    }
  }
}

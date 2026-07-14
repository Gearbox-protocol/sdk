import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import {
  type AssetsMap,
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iInfinifiGatewayAdapterAbi } from "../abi/adapters/index.js";
import { iInfinifiGatewayAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iInfinifiGatewayAdapterAbi;
type abi = typeof abi;

const protocolAbi = iInfinifiGatewayAbi;
type protocolAbi = typeof protocolAbi;

export class InfinifiGatewayAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #usdc?: Address;
  #iusd?: Address;
  #siusd?: Address;
  #allowedLockedTokens?: Address[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "usdc" },
          { type: "address", name: "iusd" },
          { type: "address", name: "siusd" },
          {
            type: "address[]",
            name: "allowedLockedTokens",
          },
        ],
        args.baseParams.serializedParams,
      );

      this.#usdc = decoded[2];
      this.#iusd = decoded[3];
      this.#siusd = decoded[4];
      this.#allowedLockedTokens = [...decoded[5]];
    }
  }

  get usdc(): Address {
    if (!this.#usdc) throw new MissingSerializedParamsError("usdc");
    return this.#usdc;
  }

  get iusd(): Address {
    if (!this.#iusd) throw new MissingSerializedParamsError("iusd");
    return this.#iusd;
  }

  get siusd(): Address {
    if (!this.#siusd) throw new MissingSerializedParamsError("siusd");
    return this.#siusd;
  }

  get allowedLockedTokens(): Address[] {
    if (!this.#allowedLockedTokens)
      throw new MissingSerializedParamsError("allowedLockedTokens");
    return this.#allowedLockedTokens;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      usdc: this.#usdc ? this.labelAddress(this.#usdc) : undefined,
      iusd: this.#iusd ? this.labelAddress(this.#iusd) : undefined,
      siusd: this.#siusd ? this.labelAddress(this.#siusd) : undefined,
      allowedLockedTokens: this.#allowedLockedTokens?.map(t =>
        this.labelAddress(t),
      ),
    };
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      case "mintDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.usdc, leftoverAmount);
        break;
      }
      // redeem, stake and lock all spend iUSD
      case "redeemDiff":
      case "stakeDiff":
      case "createPositionDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.iusd, leftoverAmount);
        break;
      }
      case "unstakeDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.siusd, leftoverAmount);
        break;
      }
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}

import { iBalancerV3RouterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../sdk/index.js";
import { iBalancerV3RouterAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

export enum BalancerV3PoolStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  EXIT_AND_SWAP = 2,
  SWAP_ONLY = 3,
  EXIT_ONLY = 4,
}

export interface BalancerV3Pool {
  pool: Address;
  status?: BalancerV3PoolStatus;
}

const abi = iBalancerV3RouterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iBalancerV3RouterAbi;
type protocolAbi = typeof protocolAbi;

export class BalancerV3RouterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedPools?: BalancerV3Pool[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const version = Number(args.baseParams.version);
      if (version <= 310) {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            { type: "address[]", name: "allowedPools" },
          ],
          args.baseParams.serializedParams,
        );
        this.#allowedPools = decoded[2].map(p => ({
          pool: p,
          status: BalancerV3PoolStatus.ALLOWED,
        }));
      } else {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            {
              type: "tuple[]",
              name: "allowedPools",
              components: [
                { type: "address", name: "pool" },
                { type: "uint8", name: "status" },
              ],
            },
          ],
          args.baseParams.serializedParams,
        );
        this.#allowedPools = decoded[2].map(p => ({
          pool: p.pool,
          status: p.status as BalancerV3PoolStatus,
        }));
      }
    }
  }

  public get allowedPools(): BalancerV3Pool[] {
    if (!this.#allowedPools)
      throw new MissingSerializedParamsError("allowedPools");
    return this.#allowedPools;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      allowedPools: this.#allowedPools?.map(p => ({
        pool: this.labelAddress(p.pool),
        status: p.status,
      })),
    };
  }
}

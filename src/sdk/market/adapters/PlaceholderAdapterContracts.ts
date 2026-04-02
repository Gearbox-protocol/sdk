import { type Address, decodeAbiParameters } from "viem";

import type { ConstructOptions } from "../../base/index.js";
import {
  MissingSerializedParamsError,
  PlaceholderContract,
} from "../../base/index.js";
import type { RelaxedBaseParams } from "../../index.js";
import type { IAdapterContract } from "./types.js";

export interface PlaceholderAdapterContractOptions {
  baseParams: RelaxedBaseParams;
}

/**
 * @internal
 */
export class PlaceholderAdapterContract
  extends PlaceholderContract
  implements IAdapterContract
{
  readonly #targetContract?: Address;
  readonly #creditManager?: Address;

  constructor(
    options: ConstructOptions,
    args: PlaceholderAdapterContractOptions,
  ) {
    super(options, args.baseParams);

    if (args.baseParams.serializedParams) {
      const [cm, tc] = decodeAbiParameters(
        [{ type: "address" }, { type: "address" }],
        args.baseParams.serializedParams,
      );
      this.#creditManager = cm;
      this.#targetContract = tc;
    }
  }

  public get targetContract(): Address {
    if (!this.#targetContract) {
      throw new MissingSerializedParamsError("targetContract");
    }
    return this.#targetContract;
  }

  public get creditManager(): Address {
    if (!this.#creditManager) {
      throw new MissingSerializedParamsError("creditManager");
    }
    return this.#creditManager;
  }
}

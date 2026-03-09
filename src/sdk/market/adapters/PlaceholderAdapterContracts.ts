import type { Address } from "viem";

import type { ConstructOptions } from "../../base/index.js";
import {
  MissingSerializedParamsError,
  PlaceholderContract,
} from "../../base/index.js";
import type { RelaxedBaseParams } from "../../index.js";
import type { IAdapterContract } from "./types.js";

export interface PlaceholderAdapterContractOptions {
  baseParams: RelaxedBaseParams;
  // TODO: v300 legacy/deprecated: serializedParams always contain targetContract and creditManager
  targetContract?: Address;
}

export class PlaceholderAdapterContract
  extends PlaceholderContract
  implements IAdapterContract
{
  readonly #targetContract?: Address;

  constructor(
    options: ConstructOptions,
    args: PlaceholderAdapterContractOptions,
  ) {
    super(options, args.baseParams);
    this.#targetContract = args.targetContract;
  }

  get targetContract(): Address {
    if (!this.#targetContract) {
      throw new MissingSerializedParamsError("targetContract");
    }
    return this.#targetContract;
  }
}

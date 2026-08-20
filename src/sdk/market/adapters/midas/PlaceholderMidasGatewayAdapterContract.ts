import { type Address, decodeAbiParameters, type Hex } from "viem";

import type { ConstructOptions } from "../../../base/index.js";
import { MissingSerializedParamsError } from "../../../base/index.js";
import {
  PlaceholderAdapterContract,
  type PlaceholderAdapterContractOptions,
} from "../PlaceholderAdapterContracts.js";
import type { IMidasAdapter, MidasGatewayAdapterParams } from "./types.js";

export class PlaceholderMidasGatewayAdapterContract
  extends PlaceholderAdapterContract
  implements IMidasAdapter
{
  readonly #gateway?: Address;
  readonly #mToken?: Address;
  readonly #quoteToken?: Address;
  readonly #phantomToken?: Address;

  constructor(
    options: ConstructOptions,
    args: PlaceholderAdapterContractOptions,
  ) {
    super(options, args);

    if (args.baseParams.serializedParams) {
      const decoded =
        PlaceholderMidasGatewayAdapterContract.decodeSerializedParams(
          args.baseParams.serializedParams,
        );
      this.#gateway = decoded.gateway;
      this.#mToken = decoded.mToken;
      this.#quoteToken = decoded.quoteToken;
      this.#phantomToken = decoded.phantomToken;
    }
  }

  static decodeSerializedParams(serialized: Hex): MidasGatewayAdapterParams {
    const [
      creditManager,
      targetContract,
      gateway,
      mToken,
      quoteToken,
      phantomToken,
      referrerId,
    ] = decodeAbiParameters(
      [
        { type: "address", name: "creditManager" },
        { type: "address", name: "targetContract" },
        { type: "address", name: "gateway" },
        { type: "address", name: "mToken" },
        { type: "address", name: "quoteToken" },
        { type: "address", name: "phantomToken" },
        { type: "bytes32", name: "referrerId" },
      ],
      serialized,
    );

    return {
      creditManager,
      targetContract,
      gateway,
      mToken,
      quoteToken,
      phantomToken,
      referrerId,
    };
  }

  get gateway(): Address {
    if (!this.#gateway) {
      throw new MissingSerializedParamsError("gateway");
    }
    return this.#gateway;
  }

  get mToken(): Address {
    if (!this.#mToken) {
      throw new MissingSerializedParamsError("mToken");
    }
    return this.#mToken;
  }

  get quoteToken(): Address {
    if (!this.#quoteToken) {
      throw new MissingSerializedParamsError("quoteToken");
    }
    return this.#quoteToken;
  }

  get phantomToken(): Address {
    if (!this.#phantomToken) {
      throw new MissingSerializedParamsError("phantomToken");
    }
    return this.#phantomToken;
  }
}

import { type Address, decodeAbiParameters, type Hex } from "viem";

import type { ConstructOptions } from "../../../base/index.js";
import { MissingSerializedParamsError } from "../../../base/index.js";
import {
  PlaceholderAdapterContract,
  type PlaceholderAdapterContractOptions,
} from "../PlaceholderAdapterContracts.js";
import type {
  IMidasAdapter,
  MidasIssuanceVaultAdapterParams,
} from "./types.js";

export class PlaceholderMidasIssuanceVaultAdapterContract
  extends PlaceholderAdapterContract
  implements IMidasAdapter
{
  readonly #mToken?: Address;
  readonly #allowedTokens?: Address[];

  constructor(
    options: ConstructOptions,
    args: PlaceholderAdapterContractOptions,
  ) {
    super(options, args);

    if (args.baseParams.serializedParams) {
      const decoded =
        PlaceholderMidasIssuanceVaultAdapterContract.decodeSerializedParams(
          args.baseParams.serializedParams,
        );
      this.#mToken = decoded.mToken;
      this.#allowedTokens = decoded.allowedTokens;
    }
  }

  static decodeSerializedParams(
    serialized: Hex,
  ): MidasIssuanceVaultAdapterParams {
    const [creditManager, targetContract, mToken, referrerId, allowedTokens] =
      decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "mToken" },
          { type: "bytes32", name: "referrerId" },
          { type: "address[]", name: "allowedTokens" },
        ],
        serialized,
      );

    return {
      creditManager,
      targetContract,
      mToken,
      referrerId,
      allowedTokens: [...allowedTokens],
    };
  }

  get mToken(): Address {
    if (!this.#mToken) {
      throw new MissingSerializedParamsError("mToken");
    }
    return this.#mToken;
  }

  get allowedTokens(): Address[] {
    if (!this.#allowedTokens) {
      throw new MissingSerializedParamsError("allowedTokens");
    }
    return this.#allowedTokens;
  }
}

import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iSecuritizeRedemptionGatewayAbi } from "../abi/securitize/iSecuritizeRedemptionGateway.js";
import { iSecuritizeRedemptionGatewayAdapterAbi } from "../abi/securitize/iSecuritizeRedemptionGatewayAdapter.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

// TODO: not yet mered into integrations-v3/main branch
const abi = iSecuritizeRedemptionGatewayAdapterAbi;
type abi = typeof abi;

// TODO: not yet mered into integrations-v3/main branch
const protocolAbi = iSecuritizeRedemptionGatewayAbi;
type protocolAbi = typeof protocolAbi;

export class SecuritizeRedemptionGatewayAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #dsToken?: Address;
  #stableCoinToken?: Address;
  #redemptionPhantomToken?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "dsToken" },
          { type: "address", name: "stableCoinToken" },
          { type: "address", name: "redemptionPhantomToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#dsToken = decoded[2];
      this.#stableCoinToken = decoded[3];
      this.#redemptionPhantomToken = decoded[4];
    }
  }

  get dsToken(): Address {
    if (!this.#dsToken) throw new MissingSerializedParamsError("dsToken");
    return this.#dsToken;
  }

  get stableCoinToken(): Address {
    if (!this.#stableCoinToken)
      throw new MissingSerializedParamsError("stableCoinToken");
    return this.#stableCoinToken;
  }

  get redemptionPhantomToken(): Address {
    if (!this.#redemptionPhantomToken)
      throw new MissingSerializedParamsError("redemptionPhantomToken");
    return this.#redemptionPhantomToken;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      dsToken: this.#dsToken ? this.labelAddress(this.#dsToken) : undefined,
      stableCoinToken: this.#stableCoinToken
        ? this.labelAddress(this.#stableCoinToken)
        : undefined,
      redemptionPhantomToken: this.#redemptionPhantomToken
        ? this.labelAddress(this.#redemptionPhantomToken)
        : undefined,
    };
  }
}

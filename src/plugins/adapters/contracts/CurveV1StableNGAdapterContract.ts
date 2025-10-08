import { iCurveV1StableNgAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iCurveV1StableNgAdapterAbi;
type abi = typeof abi;

export class CurveV1StableNGAdapterContract extends AbstractAdapterContract<abi> {
  public readonly token: Address;
  public readonly lpToken: Address;
  public readonly metapoolBase: Address;
  public readonly nCoins: number;
  public readonly use256: boolean;
  public readonly tokens: [Address, Address, Address, Address];
  public readonly underlyings: [Address, Address, Address, Address];

  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(sdk, { ...args, abi });

    // Decode parameters directly using ABI decoding
    const decoded = decodeAbiParameters(
      [
        { type: "address", name: "creditManager" },
        { type: "address", name: "targetContract" },
        { type: "address", name: "token" },
        { type: "address", name: "lpToken" },
        { type: "address", name: "metapoolBase" },
        { type: "uint256", name: "nCoins" },
        { type: "bool", name: "use256" },
        { type: "address[4]", name: "tokens" },
        { type: "address[4]", name: "underlyings" },
      ],
      args.baseParams.serializedParams,
    );

    this.token = decoded[2];
    this.lpToken = decoded[3];
    this.metapoolBase = decoded[4];
    this.nCoins = Number(decoded[5]);
    this.use256 = decoded[6];
    this.tokens = [decoded[7][0], decoded[7][1], decoded[7][2], decoded[7][3]];
    this.underlyings = [
      decoded[8][0],
      decoded[8][1],
      decoded[8][2],
      decoded[8][3],
    ];
  }
}

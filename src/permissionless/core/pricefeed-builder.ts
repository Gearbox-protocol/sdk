import type { Address, Hex, PublicClient } from "viem";

export interface PriceFeedParams {
  address: Address;
  stalenessPeriod: number;
}

export type InputValueParams =
  | string
  | number
  | boolean
  | string[]
  | PriceFeedParams[]
  | PriceFeedParams;

export type PriceFeedParamType =
  | { type: "uint256"; decimals?: number }
  | { type: "int256"; decimals?: number }
  | { type: "uint32" }
  | { type: "uint8" }
  | { type: "bool" }
  | { type: "address" }
  | { type: "bytes32"; formatValue?: (value: string) => Hex }
  | { type: "string"; maxLen?: number }
  | {
      type: "lowerbound";
      getter: (
        values: Record<string, InputValueParams>,
        publicClient: PublicClient,
      ) => Promise<bigint>;
    }
  | {
      type: "owner";
    }
  | {
      // note: if there are multiple `pricefeedParamsFlattened` parameters,
      // they must appear consecutively in the constructor definition.
      // first, all address values from these parameters will be appended,
      // followed by all corresponding stalenessPeriod values
      type: "pricefeedParamsFlattened";
    }
  | {
      type: "pricefeedParamsFixed";
      qty: number;
      minNonZero?: number;
    }
  | {
      type: "pricefeedParamsVariable";
      qty: number;
      minNonZero?: number;
    }
  | {
      type: "addressArrayFixed";
      qty: number;
      minNonZero?: number;
      minNonZeroRefLabel?: string;
    };

export interface PriceFeedConstructorParam {
  label: string;
  type: PriceFeedParamType;
  defaultValue?: InputValueParams;
  displayOrder?: number;
}

export interface PriceFeedSetupParams {
  contractType: string;
  version: number;
  constructorParams: PriceFeedConstructorParam[];
  stalenessPeriod: boolean;
}

import type { AbiParameter } from "abitype";
import { type Address, encodeAbiParameters, type Hex } from "viem";

export type ValueParams =
  | string
  | Address
  | Hex
  | number
  | bigint
  | boolean
  | string[]
  | Address[]
  | Hex[]
  | number[]
  | bigint[]
  | boolean[];

export type FunctionParams = {
  type: string;
  value: ValueParams;
};

export function encodeFunctionParams(params: FunctionParams[]): Hex {
  const types: AbiParameter[] = [];
  const values: ValueParams[] = [];

  for (const { type, value } of params) {
    switch (type) {
      case "address":
        types.push({ type: type });
        values.push(value as Address);
        break;
      case "bytes32":
        types.push({ type: type });
        values.push(value as Hex);
        break;
      case "string":
        types.push({ type: type });
        values.push(value as string);
        break;
      case "uint256":
      case "int256":
      case "uint32":
        types.push({ type: type });
        values.push(BigInt(value as string | number));
        break;
      case "uint8":
        types.push({ type: type });
        values.push(Number(value as string | number));
        break;
      case "bool":
        types.push({ type: type });
        values.push(value as boolean);
        break;

      case "address[]":
        types.push({ type: type });
        values.push(value as Address[]);
        break;
      case "bytes32[]":
        types.push({ type: type });
        values.push(value as Hex[]);
        break;
      case "string[]":
        types.push({ type: type });
        values.push(value as string[]);
        break;

      case "uint256[]":
      case "int256[]":
      case "uint32[]":
        types.push({ type: type });
        values.push((value as (string | number)[]).map(v => BigInt(v)));
        break;
      case "uint8[]":
        types.push({ type: type });
        values.push((value as (string | number)[]).map(v => Number(v)));
        break;
      case "bool[]":
        types.push({ type: type });
        values.push(value as boolean[]);
        break;
    }
  }

  return encodeAbiParameters(types, values);
}

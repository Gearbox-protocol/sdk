import type { Address } from "viem";
import {
  AbiDecodingDataSizeTooSmallError,
  AbiDecodingZeroDataError,
  BaseError,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
} from "viem";
import type { GipBuilderContext } from "../builderContext.js";

/** A failed source read remains unknown unless the contract itself rejected it. */
export type ChainRead<T> =
  | { value: T; error?: never }
  | { value?: never; error: unknown };

export async function readChain<T>(
  read: () => Promise<T>,
): Promise<ChainRead<T>> {
  try {
    return { value: await read() };
  } catch (error) {
    return { error };
  }
}

export function contractRejected(read: { error?: unknown }): boolean {
  const error = read.error;
  return (
    error instanceof BaseError &&
    !!error.walk(
      cause =>
        cause instanceof ContractFunctionRevertedError ||
        cause instanceof ContractFunctionZeroDataError ||
        cause instanceof AbiDecodingZeroDataError ||
        cause instanceof AbiDecodingDataSizeTooSmallError,
    )
  );
}

/** Neither read nor rejected: the check it feeds could not be completed. **/
export function isUnknown(read: ChainRead<unknown>): boolean {
  return read.value === undefined && !contractRejected(read);
}

export function readBytecode(
  ctx: GipBuilderContext,
  address: Address,
): Promise<ChainRead<boolean>> {
  return readChain(async () => {
    const code = await ctx.client.getCode({ address });
    return !!code && code !== "0x";
  });
}

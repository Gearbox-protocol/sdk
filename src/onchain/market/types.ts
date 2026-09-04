import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address } from "viem";
import type { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import type { Unarray } from "../base/index.js";

/**
 * Single zapper as reported by the periphery compressor, before the SDK
 * attaches the pool it belongs to and its {@link ZapperData.type}.
 **/
export type CompressorZapperData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof peripheryCompressorAbi, "getZappers">["outputs"]
  >
>;

export interface ZapperData extends CompressorZapperData {
  pool: Address;
  type: "migration" | "rwa" | "base";
}

import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address } from "viem";
import type { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import type { Unarray } from "../base/index.js";

type CompressorZapperData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof peripheryCompressorAbi, "getZappers">["outputs"]
  >
>;

export interface ZapperData extends CompressorZapperData {
  pool: Address;
  type: "migration" | "kyc" | "base";
}

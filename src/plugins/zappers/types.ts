import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address } from "viem";
import type { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import type { BaseContractStateHuman, Unarray } from "../../sdk/index.js";

export type ZapperData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof peripheryCompressorAbi, "getZappers">["outputs"]
  >
>;

export interface ZapperDataFull extends ZapperData {
  pool: Address;
}

export interface ZapperStateHuman extends BaseContractStateHuman {
  tokenIn: string;
  tokenOut: string;
}

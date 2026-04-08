import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { ContractFunctionParameters } from "viem";
import type { iKYCCompressorAbi } from "../../../abi/kyc/iKYCCompressor.js";
import type { Unarray } from "../../base/index.js";

export type KYCCompressorResponse = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof iKYCCompressorAbi, "getKYCMarketsData">["outputs"]
>;

/**
 * On-chain state of a KYC underlying token.
 **/
export type KYCUnderlyingData = Unarray<KYCCompressorResponse[0]>;

/**
 * On-chain state of a KYC factory.
 */
export type KYCFactoryData = Unarray<KYCCompressorResponse[1]>;

export type KYCCOmpressorCall = ContractFunctionParameters<
  typeof iKYCCompressorAbi,
  "view",
  "getKYCMarketsData"
>;

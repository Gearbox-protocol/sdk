import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address, ContractFunctionParameters } from "viem";
import type { iKYCCompressorAbi } from "../../../abi/kyc/iKYCCompressor.js";
import type { Unarray } from "../../base/index.js";
import type {
  SecuritizeInvestorData,
  SecuritizeKYCFactoryStateHuman,
} from "./securitize-types.js";

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

export type KYCCompressorInvestorData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof iKYCCompressorAbi,
      "getKYCInvestorData"
    >["outputs"]
  >[0]
>;

export type KYCState = KYCCompressorResponse;

export interface DStokenData {
  address: Address;
  registrar: Address;
  operators: Address[];
}

export type InvestorData = SecuritizeInvestorData;

export type KYCFactoryStateHuman = SecuritizeKYCFactoryStateHuman;

export interface KYCStateHuman {
  factories: KYCFactoryStateHuman[];
}

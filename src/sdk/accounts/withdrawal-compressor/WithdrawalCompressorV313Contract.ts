import type { Address } from "viem";
import { iWithdrawalCompressorV313Abi } from "../../../abi/IWithdrawalCompressorV313.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { AbstractWithdrawalCompressorContract } from "./AbstractWithdrawalCompressorContract.js";

const abi = iWithdrawalCompressorV313Abi;
type abi = typeof abi;

/**
 * V3.13 implementation of the {@link IWithdrawalCompressorContract} interface.
 **/
export class WithdrawalCompressorV313Contract extends AbstractWithdrawalCompressorContract<abi> {
  constructor(sdk: OnchainSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "WithdrawalCompressorV313",
      abi,
      version: 313,
    });
  }
}

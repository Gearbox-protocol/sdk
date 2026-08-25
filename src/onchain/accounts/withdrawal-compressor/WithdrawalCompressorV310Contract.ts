import type { Address } from "viem";
import { iWithdrawalCompressorV310Abi } from "../../../abi/IWithdrawalCompressorV310.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { AbstractWithdrawalCompressorContract } from "./AbstractWithdrawalCompressorContract.js";

const abi = iWithdrawalCompressorV310Abi;
type abi = typeof abi;

/**
 * V3.10 implementation of the {@link IWithdrawalCompressorContract} interface.
 **/
export class WithdrawalCompressorV310Contract extends AbstractWithdrawalCompressorContract<abi> {
  constructor(sdk: OnchainSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "WithdrawalCompressorV310",
      abi,
      version: 310,
    });
  }
}

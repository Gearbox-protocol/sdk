import type { Address } from "viem";
import { iWithdrawalCompressorV311Abi } from "../../../abi/IWithdrawalCompressorV311.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { AbstractWithdrawalCompressorContract } from "./AbstractWithdrawalCompressorContract.js";

const abi = iWithdrawalCompressorV311Abi;
type abi = typeof abi;

/**
 * V3.11 implementation of the {@link IWithdrawalCompressorContract} interface.
 **/
export class WithdrawalCompressorV311Contract extends AbstractWithdrawalCompressorContract<abi> {
  constructor(sdk: OnchainSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "WithdrawalCompressorV311",
      abi,
      version: 311,
    });
  }
}

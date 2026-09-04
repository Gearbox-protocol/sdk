import type { Address } from "viem";
import { iethZapperAbi } from "../../../abi/iETHZapper.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { RawTx } from "../../types/index.js";
import type { ZapperData } from "../types.js";
import { ZapperContract } from "./ZapperContract.js";

const abi = iethZapperAbi;
type abi = typeof abi;

export class IETHZapperContract extends ZapperContract<abi> {
  constructor(sdk: OnchainSDK, data: ZapperData) {
    super(sdk, data, abi, "ETHZapper");
  }

  /**
   * Deposits native ETH into the pool via this zapper.
   */
  public deposit(receiver: Address): RawTx {
    return this.createRawTx({
      functionName: "deposit",
      args: [receiver],
    });
  }

  /**
   * Deposits native ETH into the pool via this zapper using a referral code.
   * The caller must attach the deposit amount as msg.value.
   */
  public depositWithReferral(receiver: Address, referralCode: bigint): RawTx {
    return this.createRawTx({
      functionName: "depositWithReferral",
      args: [receiver, referralCode],
    });
  }
}

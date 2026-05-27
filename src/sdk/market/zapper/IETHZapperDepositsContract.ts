import type { Address } from "viem";
import { iethZapperDepositsAbi } from "../../../abi/iETHZapperDeposits.js";
import type { BaseContractArgs, ConstructOptions } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { RawTx } from "../../types/index.js";

const abi = iethZapperDepositsAbi;
type abi = typeof abi;

export class IETHZapperDepositsContract extends BaseContract<abi> {
  constructor(
    options: ConstructOptions,
    args: Omit<BaseContractArgs<abi>, "abi">,
  ) {
    super(options, { ...args, abi });
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

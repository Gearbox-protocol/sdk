import type { Address, Hex } from "viem";
import { ierc20ZapperDepositsAbi } from "../../../abi/iERC20ZapperDeposits.js";
import type { BaseContractArgs, ConstructOptions } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { RawTx } from "../../types/index.js";

const abi = ierc20ZapperDepositsAbi;
type abi = typeof abi;

export class IERC20ZapperDepositsContract extends BaseContract<abi> {
  constructor(
    options: ConstructOptions,
    args: Omit<BaseContractArgs<abi>, "abi">,
  ) {
    super(options, { ...args, abi });
  }

  /**
   * Deposits ERC20 tokens into the pool via this zapper using a referral code.
   */
  public depositWithReferral(
    tokenInAmount: bigint,
    receiver: Address,
    referralCode: bigint,
  ): RawTx {
    return this.createRawTx({
      functionName: "depositWithReferral",
      args: [tokenInAmount, receiver, referralCode],
    });
  }

  /**
   * Deposits ERC20 tokens via this zapper with a referral code and an
   * EIP-2612 permit signature, skipping a separate approve transaction.
   */
  public depositWithReferralAndPermit(
    tokenInAmount: bigint,
    receiver: Address,
    referralCode: bigint,
    deadline: bigint,
    v: number,
    r: Hex,
    s: Hex,
  ): RawTx {
    return this.createRawTx({
      functionName: "depositWithReferralAndPermit",
      args: [tokenInAmount, receiver, referralCode, deadline, v, r, s],
    });
  }
}

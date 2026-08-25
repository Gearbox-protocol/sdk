import type { Address, Hex } from "viem";
import { ierc20ZapperAbi } from "../../../abi/iERC20Zapper.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { RawTx } from "../../types/index.js";
import type { ZapperData } from "../types.js";
import { ZapperContract } from "./ZapperContract.js";

const abi = ierc20ZapperAbi;
type abi = typeof abi;

export class IERC20ZapperContract extends ZapperContract<abi> {
  constructor(sdk: OnchainSDK, data: ZapperData) {
    super(sdk, data, abi, "ERC20Zapper");
  }

  /**
   * Deposits ERC20 tokens into the pool via this zapper.
   */
  public deposit(tokenInAmount: bigint, receiver: Address): RawTx {
    return this.createRawTx({
      functionName: "deposit",
      args: [tokenInAmount, receiver],
    });
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

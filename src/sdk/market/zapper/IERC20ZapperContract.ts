import type { Address, Hex } from "viem";
import { ierc20ZapperAbi } from "../../../abi/iERC20Zapper.js";
import { BaseContract } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { RawTx } from "../../types/index.js";
import type { ZapperData } from "../types.js";

const abi = ierc20ZapperAbi;
type abi = typeof abi;

export class IERC20ZapperContract
  extends BaseContract<abi>
  implements ZapperData
{
  public readonly pool: ZapperData["pool"];
  public readonly type: ZapperData["type"];
  public readonly baseParams: ZapperData["baseParams"];
  public readonly tokenIn: ZapperData["tokenIn"];
  public readonly tokenOut: ZapperData["tokenOut"];

  constructor(sdk: OnchainSDK, data: ZapperData) {
    super(sdk, {
      addr: data.baseParams.addr,
      abi,
      name: `ERC20Zapper(${sdk.labelAddress(data.baseParams.addr)})`,
      version: data.baseParams.version,
      contractType: data.baseParams.contractType,
    });
    this.pool = data.pool;
    this.type = data.type;
    this.baseParams = data.baseParams;
    this.tokenIn = data.tokenIn;
    this.tokenOut = data.tokenOut;
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

  /**
   * Redeems pool shares (diesel tokens) for the underlying asset via this zapper.
   */
  public redeem(tokenInAmount: bigint, receiver: Address): RawTx {
    return this.createRawTx({
      functionName: "redeem",
      args: [tokenInAmount, receiver],
    });
  }

  /**
   * Redeems pool shares via this zapper with an EIP-2612 permit signature,
   * skipping a separate approve transaction.
   */
  public redeemWithPermit(
    tokenInAmount: bigint,
    receiver: Address,
    deadline: bigint,
    v: number,
    r: Hex,
    s: Hex,
  ): RawTx {
    return this.createRawTx({
      functionName: "redeemWithPermit",
      args: [tokenInAmount, receiver, deadline, v, r, s],
    });
  }
}

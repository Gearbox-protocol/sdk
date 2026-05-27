import type { Address } from "viem";
import { iethZapperAbi } from "../../../abi/iETHZapper.js";
import { BaseContract } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { RawTx } from "../../types/index.js";
import type { ZapperData } from "../types.js";

const abi = iethZapperAbi;
type abi = typeof abi;

export class IETHZapperContract
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
      name: `ETHZapper(${sdk.labelAddress(data.baseParams.addr)})`,
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
    r: Address,
    s: Address,
  ): RawTx {
    return this.createRawTx({
      functionName: "redeemWithPermit",
      args: [tokenInAmount, receiver, deadline, v, r, s],
    });
  }
}

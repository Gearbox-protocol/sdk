import type { Abi, Address, Hex } from "viem";
import { iZapperAbi } from "../../../abi/iZapper.js";
import { BaseContract } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { RawTx } from "../../types/index.js";
import type { ZapperData } from "../types.js";
import { UnsupportedZapperFunctionError } from "./errors.js";
import type { IZapperContract, ParsedZapperOperation } from "./types.js";

/**
 * Base contract for every Gearbox zapper. Specialized zappers (e.g.
 * {@link IERC20ZapperContract}, {@link IETHZapperContract}) extend this and add
 * their type-specific deposit helpers; unknown zapper types are represented by
 * this class directly, decoding against the common {@link iZapperAbi}.
 */
export class ZapperContract<A extends Abi = Abi>
  extends BaseContract<A>
  implements IZapperContract
{
  public readonly sdk: OnchainSDK;
  public readonly pool: ZapperData["pool"];
  public readonly type: ZapperData["type"];
  public readonly baseParams: ZapperData["baseParams"];
  public readonly tokenIn: ZapperData["tokenIn"];
  public readonly tokenOut: ZapperData["tokenOut"];

  constructor(
    sdk: OnchainSDK,
    data: ZapperData,
    abi: A = iZapperAbi as unknown as A,
    namePrefix = "Zapper",
  ) {
    super(sdk, {
      addr: data.baseParams.addr,
      abi,
      name: `${namePrefix}(${sdk.labelAddress(data.baseParams.addr)})`,
      version: data.baseParams.version,
      contractType: data.baseParams.contractType,
    });
    this.sdk = sdk;
    this.pool = data.pool;
    this.type = data.type;
    this.baseParams = data.baseParams;
    this.tokenIn = data.tokenIn;
    this.tokenOut = data.tokenOut;
  }

  /**
   * Decodes zapper calldata into {@link ParsedZapperOperation}.
   * Throws {@link UnsupportedZapperFunctionError} for unknown selectors.
   */
  public parseOperation(calldata: Hex, value?: bigint): ParsedZapperOperation {
    // Generic code that works for any zapper: deposit and redeem
    // variants are recognized by their function-name prefix, the moved token is
    // the zapper's `tokenIn`, deposit amounts come from the `tokenInAmount` argument
    // for token zappers, or from `value` (the tx `msg.value`) for native-token zappers
    // whose deposit is `payable`.
    const parsed = this.parseFunctionDataV2(calldata);
    const { rawArgs } = parsed;

    const pool = this.pool;
    const zapper = this.address;
    const underlying = this.sdk.marketRegister.findByPool(pool).underlying;
    const receiver = rawArgs.receiver as Address;

    if (parsed.functionName.startsWith("deposit")) {
      return {
        operation: "Deposit",
        pool,
        zapper,
        receiver,
        assets: (rawArgs.tokenInAmount as bigint | undefined) ?? value ?? 0n,
        underlying,
        referralCode: rawArgs.referralCode as bigint | undefined,
      };
    }

    if (parsed.functionName.startsWith("redeem")) {
      return {
        operation: "Redeem",
        pool,
        zapper,
        receiver,
        shares: rawArgs.tokenOutAmount as bigint,
        underlying,
      };
    }

    throw new UnsupportedZapperFunctionError(zapper, parsed.functionName);
  }

  /**
   * Redeems pool shares (diesel tokens) for the underlying asset via this zapper.
   */
  public redeem(tokenInAmount: bigint, receiver: Address): RawTx {
    return (this as unknown as ZapperContract<typeof iZapperAbi>).createRawTx({
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
    return (this as unknown as ZapperContract<typeof iZapperAbi>).createRawTx({
      functionName: "redeemWithPermit",
      args: [tokenInAmount, receiver, deadline, v, r, s],
    });
  }
}

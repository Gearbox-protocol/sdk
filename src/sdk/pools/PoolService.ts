import type { Address } from "viem";
import { iPoolV310Abi } from "../../abi/310/generated.js";
import { ierc20ZapperDepositsAbi } from "../../abi/iERC20ZapperDeposits.js";
import { iethZapperDepositsAbi } from "../../abi/iETHZapperDeposits.js";
import { iZapperAbi } from "../../abi/iZapper.js";
import { SDKConstruct, type TokenMetaData } from "../base/index.js";
import { NATIVE_ADDRESS } from "../constants/index.js";
import type { ZapperData } from "../market/index.js";
import { AddressSet, hexEq } from "../utils/index.js";
import { POOL_TOKENS_TO_MIGRATE } from "./constants.js";
import type {
  AddLiquidityProps,
  DepositMetadata,
  IPoolsService,
  PoolServiceCall,
  RemoveLiquidityProps,
  WithdrawalMetadata,
} from "./types.js";

export class PoolService extends SDKConstruct implements IPoolsService {
  /**
   * @inheritdoc IPoolsService.getDepositTokensIn
   */
  public getDepositTokensIn(pool: Address): Address[] {
    // classic pool, allow direct deposit of underlying and via zappers
    return this.#depositTokensIn(pool, true);
  }

  /**
   * @inheritdoc IPoolsService.getDepositTokensOut
   */
  public getDepositTokensOut(pool: Address, tokenIn: Address): Address[] {
    // classic pool, allow direct deposit of underlying and via zappers
    return this.#depositTokensOut(pool, tokenIn, true);
  }

  /**
   * @inheritdoc IPoolsService.getDepositMetadata
   */
  public getDepositMetadata(
    pool: Address,
    tokenIn: Address,
    tokenOut?: Address,
  ): DepositMetadata {
    return this.#depositMetadata("classic", pool, tokenIn, tokenOut, true);
  }

  /**
   * @inheritdoc IPoolsService.addLiquidity
   */
  public addLiquidity(props: AddLiquidityProps): PoolServiceCall | undefined {
    const { collateral, meta, permit, referralCode, pool, wallet } = props;
    const { zapper } = meta;

    if (zapper && hexEq(zapper.tokenIn.addr, NATIVE_ADDRESS)) {
      return {
        target: zapper.baseParams.addr,
        abi: iethZapperDepositsAbi,
        functionName: "depositWithReferral",
        args: [wallet, referralCode],
        value: collateral.balance,
      };
    } else if (zapper) {
      return permit
        ? {
            target: zapper.baseParams.addr,
            abi: ierc20ZapperDepositsAbi,
            functionName: "depositWithReferralAndPermit",
            args: [
              collateral.balance,
              wallet,
              referralCode,
              permit.deadline,
              permit.v,
              permit.r,
              permit.s,
            ],
          }
        : {
            target: zapper.baseParams.addr,
            abi: ierc20ZapperDepositsAbi,
            functionName: "depositWithReferral",
            args: [collateral.balance, wallet, referralCode],
          };
    } else {
      return {
        target: pool,
        abi: iPoolV310Abi,
        functionName: "depositWithReferral",
        args: [collateral.balance, wallet, referralCode],
      };
    }
  }

  /**
   * @inheritdoc IPoolsService.getWithdrawalTokensIn
   */
  public getWithdrawalTokensIn(pool: Address): Address[] {
    // classic pool, allow direct withdrawal of underlying and via zappers
    return this.#withdrawalTokensIn(pool, true);
  }

  /**
   * @inheritdoc IPoolsService.getWithdrawalTokensOut
   */
  public getWithdrawalTokensOut(pool: Address, tokenIn: Address): Address[] {
    // classic pool, allow direct deposit of underlying and via zappers
    return this.#withdrawalTokensOut(pool, tokenIn, true);
  }

  /**
   * @inheritdoc IPoolsService.removeLiquidity
   */
  public removeLiquidity(props: RemoveLiquidityProps): PoolServiceCall {
    const { pool, amount, meta, wallet, permit } = props;

    if (meta.zapper) {
      return permit
        ? {
            target: meta.zapper.baseParams.addr,
            abi: iZapperAbi,
            functionName: "redeemWithPermit",
            args: [
              amount,
              wallet,
              permit.deadline,
              permit.v,
              permit.r,
              permit.s,
            ],
          }
        : {
            target: meta.zapper.baseParams.addr,
            abi: iZapperAbi,
            functionName: "redeem",
            args: [amount, wallet],
          };
    }

    return {
      target: pool,
      abi: iPoolV310Abi,
      functionName: "redeem",
      args: [amount, wallet, wallet],
    };
  }

  /**
   * @inheritdoc IPoolsService.getWithdrawalMetadata
   */
  public getWithdrawalMetadata(
    pool: Address,
    tokenIn: Address,
    tokenOut?: Address,
  ): WithdrawalMetadata {
    return this.#withdrawalMetadata("classic", pool, tokenIn, tokenOut, true);
  }

  /**
   * TODO: do we still need this after v3.0 deprecation?
   * Filter out v2 diesel tokens (can come from migration v2 -> v3 zappers)
   * Also omits "migration" zappers (v3 -> v3.1) since they are treated in a different way
   */
  #getDepositZappers(poolAddr: Address) {
    const zappers = this.sdk.marketRegister.poolZappers(poolAddr);
    return zappers.filter(
      z =>
        z.type !== "migration" && !POOL_TOKENS_TO_MIGRATE.has(z.tokenIn.addr),
    );
  }

  #depositTokensIn(poolAddr: Address, allowDirectDeposit: boolean): Address[] {
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);
    const result: AddressSet = new AddressSet();

    if (allowDirectDeposit) {
      result.add(pool.underlying);
    }

    // find all zappers that produce pool.dieselToken (=== pool.address)
    const zappers = this.#getDepositZappers(poolAddr);
    for (const z of zappers) {
      if (hexEq(z.tokenOut.addr, poolAddr)) {
        result.add(z.tokenIn.addr);
      }
    }

    if (result.size === 0) {
      throw new Error(
        `No tokensIn found for pool ${this.labelAddress(poolAddr)}`,
      );
    }

    return result.asArray();
  }

  #withdrawalTokensIn(
    poolAddr: Address,
    allowDirectDeposit: boolean,
  ): Address[] {
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);

    const result: AddressSet = new AddressSet();

    // if direct withdrawal is allowed, add pool.address (aka dieselToken)
    if (allowDirectDeposit && pool) {
      result.add(poolAddr);
    }

    // find all zappers tokenOut (since withdrawing is allowed from any asset)
    const zappers = this.#getDepositZappers(poolAddr);
    for (const z of zappers) {
      result.add(z.tokenOut.addr);
    }

    if (result.size === 0) {
      throw new Error(
        `No tokensIn found for pool ${this.labelAddress(poolAddr)}`,
      );
    }

    return result.asArray();
  }

  #depositTokensOut(
    poolAddr: Address,
    tokenIn: Address,
    allowDirectDeposit: boolean,
  ): Address[] {
    const result = new AddressSet();
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);

    // find all zappers by tokenIn, get their tokenOuts
    const zappers = this.#getDepositZappers(poolAddr);
    for (const z of zappers) {
      // TODO: do we still need this after v3.0 deprecation?
      // filter out v2 diesel tokens (can come from migration v2 -> v3 zappers)
      if (hexEq(z.tokenIn.addr, tokenIn)) {
        result.add(z.tokenOut.addr);
      }
    }

    // if direct deposit is allowed, add pool.address (aka dieselToken)
    if (allowDirectDeposit && hexEq(tokenIn, pool.underlying)) {
      result.add(poolAddr);
    }

    if (result.size === 0) {
      throw new Error(
        `No tokensOut found for tokenIn ${this.labelAddress(
          tokenIn,
        )} on pool ${this.labelAddress(poolAddr)}`,
      );
    }

    const r = result.asArray();
    return r;
  }

  #withdrawalTokensOut(
    poolAddr: Address,
    tokenIn: Address,
    allowDirectDeposit: boolean,
  ): Address[] {
    const result = new AddressSet();
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);

    // find all zappers by tokenIn, get their tokenOuts
    const zappers = this.#getDepositZappers(poolAddr);
    for (const z of zappers) {
      if (hexEq(z.tokenOut.addr, tokenIn)) {
        result.add(z.tokenIn.addr);
      }
    }

    // if direct deposit is allowed, add pool.address (aka dieselToken)
    if (allowDirectDeposit && hexEq(tokenIn, poolAddr)) {
      result.add(pool.underlying);
    }

    if (result.size === 0) {
      throw new Error(
        `No tokensOut found for tokenIn ${this.labelAddress(
          tokenIn,
        )} on pool ${this.labelAddress(poolAddr)}`,
      );
    }

    const r = result.asArray();
    return r;
  }

  /**
   * TODO: do we still need this after v3.0 deprecation?
   * Filter out v2 diesel tokens (can come from migration v2 -> v3 zappers)
   * Also omits "migration" zappers (v3 -> v3.1) since they are treated in a different way
   */
  #getDepositZapper(
    poolAddr: Address,
    tokenIn: Address,
    tokenOut: Address,
  ): ZapperData | undefined {
    const zappers = this.sdk.marketRegister
      .getZapper(poolAddr, tokenIn, tokenOut)
      ?.filter(
        z =>
          z.type !== "migration" && !POOL_TOKENS_TO_MIGRATE.has(z.tokenIn.addr),
      );
    if (zappers && zappers.length > 1) {
      throw new Error(
        `Multiple zappers found for tokenIn ${this.labelAddress(
          tokenIn,
        )} and tokenOut ${this.labelAddress(
          tokenOut,
        )} on pool ${this.labelAddress(poolAddr)}`,
      );
    }

    return zappers?.[0];
  }

  #depositMetadata(
    type: DepositMetadata["type"],
    poolAddr: Address,
    tokenIn: Address,
    tokenOut?: Address,
    allowDirectDeposit?: boolean,
  ): DepositMetadata {
    if (!tokenOut) {
      throw new Error("tokenOut is required for classic pool deposit");
    }
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);

    const zapper = this.#getDepositZapper(poolAddr, tokenIn, tokenOut);
    if (!zapper && !allowDirectDeposit) {
      throw new Error(
        `No zapper found for tokenIn ${this.labelAddress(
          tokenIn,
        )} and tokenOut ${this.labelAddress(
          tokenOut,
        )} on pool ${this.labelAddress(poolAddr)}`,
      );
    }

    return {
      zapper,
      // zapper or pool itself
      approveTarget: zapper?.baseParams.addr ?? pool.pool.address,
      // TODO: instead of permissible, return permitType depending on tokenIn
      // "none" | "eip2612" | "dai_like";
      permissible: !!zapper && !hexEq(tokenIn, NATIVE_ADDRESS),
      type,
    };
  }

  #withdrawalMetadata(
    type: DepositMetadata["type"],
    poolAddr: Address,
    tokenIn: Address,
    tokenOut?: Address,
    allowDirectDeposit?: boolean,
  ): WithdrawalMetadata {
    if (!tokenOut) {
      throw new Error("tokenOut is required for classic pool deposit");
    }

    const zapper = this.#getDepositZapper(poolAddr, tokenOut, tokenIn);
    if (!zapper && !allowDirectDeposit) {
      throw new Error(
        `No zapper found for tokenIn ${this.labelAddress(
          tokenOut,
        )} and tokenOut ${this.labelAddress(
          tokenIn,
        )} on pool ${this.labelAddress(poolAddr)}`,
      );
    }

    return {
      zapper,
      // zapper or pool itself
      approveTarget: zapper?.baseParams.addr,
      // TODO: instead of permissible, return permitType depending on tokenIn
      // "none" | "eip2612" | "dai_like";
      permissible: !!zapper,
      type,
    };
  }

  #describeUnderlying(pool: Address): TokenMetaData {
    const market = this.sdk.marketRegister.findByPool(pool);
    return this.sdk.tokensMeta.mustGet(market.underlying);
  }
}

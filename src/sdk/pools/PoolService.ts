import type { Address } from "viem";
import { ierc20Abi } from "../../abi/iERC20.js";
import { ierc20ZapperDepositsAbi } from "../../abi/iERC20ZapperDeposits.js";
import { iethZapperDepositsAbi } from "../../abi/iETHZapperDeposits.js";
import { iZapperAbi } from "../../abi/iZapper.js";
import { iPoolV300Abi } from "../../abi/v300.js";
import {
  KYC_UNDERLYING_DEFAULT,
  KYC_UNDERLYING_ON_DEMAND,
  SDKConstruct,
  type TokenMetaData,
} from "../base/index.js";
import { AddressSet, hexEq, type ZapperData } from "../index.js";
import { AddressMap } from "../utils/index.js";
import type {
  AddLiquidityProps,
  DepositMetadata,
  IPoolsService,
  PoolServiceCall,
  RemoveLiquidityProps,
  WithdrawalMetadata,
} from "./types.js";

const NATIVE_ADDRESS: Address = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

/**
 * This map is used to filter out zappers with tokenIn === v2 diesel tokens
 * such zappers are returned by compressor but useless for v3 pools on deposit step
 */
const POOL_TOKENS_TO_MIGRATE: AddressMap<string> = new AddressMap([
  // v2 diesels
  ["0x6CFaF95457d7688022FC53e7AbE052ef8DFBbdBA", "dDAI"],
  ["0xc411dB5f5Eb3f7d552F9B8454B2D74097ccdE6E3", "dUSDC"],
  ["0xe753260F1955e8678DCeA8887759e07aa57E8c54", "dWBTC"],
  ["0xF21fc650C1B34eb0FDE786D52d23dA99Db3D6278", "dWETH"],
  ["0x2158034dB06f06dcB9A786D2F1F8c38781bA779d", "dwstETH"],
  ["0x8A1112AFef7F4FC7c066a77AABBc01b3Fff31D47", "dFRAX"],
]);

export class PoolService extends SDKConstruct implements IPoolsService {
  public getDepositTokensIn(pool: Address): Address[] {
    const underlying = this.#describeUnderlying(pool);
    if (this.sdk.tokensMeta.isKYCUnderlying(underlying)) {
      switch (underlying.contractType) {
        case KYC_UNDERLYING_DEFAULT:
          return this.#depositTokensIn(pool, false);
        case KYC_UNDERLYING_ON_DEMAND:
          return [underlying.asset];
      }
    }

    // classic pool, allow direct deposit of underlying and via zappers
    return this.#depositTokensIn(pool, true);
  }
  public getDepositTokensOut(pool: Address, tokenIn: Address): Address[] {
    const underlying = this.#describeUnderlying(pool);

    if (this.sdk.tokensMeta.isKYCUnderlying(underlying)) {
      switch (underlying.contractType) {
        case KYC_UNDERLYING_DEFAULT:
          return this.#depositTokensOut(pool, tokenIn, false);
        case KYC_UNDERLYING_ON_DEMAND:
          return [];
      }
    }

    // classic pool, allow direct deposit of underlying and via zappers
    return this.#depositTokensOut(pool, tokenIn, true);
  }

  public getDepositMetadata(
    pool: Address,
    tokenIn: Address,
    tokenOut?: Address,
  ): DepositMetadata {
    const underlying = this.#describeUnderlying(pool);

    if (this.sdk.tokensMeta.isKYCUnderlying(underlying)) {
      switch (underlying.contractType) {
        case KYC_UNDERLYING_DEFAULT: {
          return this.#depositMetadata(
            "kyc-default",
            pool,
            tokenIn,
            tokenOut,
            false,
          );
        }
        case KYC_UNDERLYING_ON_DEMAND:
          return {
            zapper: undefined,
            approveTarget: underlying.liquidityProvider,
            permissible: false,
            type: "kyc-on-demand",
          };
      }
    }

    return this.#depositMetadata("classic", pool, tokenIn, tokenOut, true);
  }

  public addLiquidity(props: AddLiquidityProps): PoolServiceCall | undefined {
    const { collateral, meta, permit, referralCode, pool, wallet } = props;

    const underlying = this.#describeUnderlying(pool);

    if (this.sdk.tokensMeta.isKYCUnderlying(underlying)) {
      if (underlying.contractType === KYC_UNDERLYING_ON_DEMAND) {
        return undefined;
      }
    }

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
        abi: iPoolV300Abi,
        functionName: "depositWithReferral",
        args: [collateral.balance, wallet, referralCode],
      };
    }
  }

  public getWithdrawalTokensIn(pool: Address): Address[] {
    const underlying = this.#describeUnderlying(pool);
    if (this.sdk.tokensMeta.isKYCUnderlying(underlying)) {
      switch (underlying.contractType) {
        case KYC_UNDERLYING_DEFAULT:
          return this.#withdrawalTokensIn(pool, false);
        case KYC_UNDERLYING_ON_DEMAND:
          return [];
      }
    }

    // classic pool, allow direct withdrawal of underlying and via zappers
    return this.#withdrawalTokensIn(pool, true);
  }
  public getWithdrawalTokensOut(pool: Address, tokenIn: Address): Address[] {
    const underlying = this.#describeUnderlying(pool);
    if (this.sdk.tokensMeta.isKYCUnderlying(underlying)) {
      switch (underlying.contractType) {
        case KYC_UNDERLYING_DEFAULT:
          return this.#withdrawalTokensOut(pool, tokenIn, false);
        case KYC_UNDERLYING_ON_DEMAND:
          return [underlying.asset];
      }
    }

    // classic pool, allow direct deposit of underlying and via zappers
    return this.#withdrawalTokensOut(pool, tokenIn, true);
  }

  public removeLiquidity(props: RemoveLiquidityProps): PoolServiceCall {
    const { pool, amount, meta, wallet, permit } = props;

    const underlying = this.#describeUnderlying(pool);
    if (this.sdk.tokensMeta.isKYCUnderlying(underlying)) {
      if (underlying.contractType === KYC_UNDERLYING_ON_DEMAND) {
        // in this flow, withdrawal === set allowance to 0
        return {
          abi: ierc20Abi,
          functionName: "approve",
          args: [underlying.liquidityProvider, 0n],
          target: underlying.asset,
        };
      }
    }

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
      abi: iPoolV300Abi,
      functionName: "redeem",
      args: [amount, wallet, wallet],
    };
  }

  public getWithdrawalMetadata(
    pool: Address,
    tokenIn: Address,
    tokenOut?: Address,
  ): WithdrawalMetadata {
    const underlying = this.#describeUnderlying(pool);

    if (this.sdk.tokensMeta.isKYCUnderlying(underlying)) {
      switch (underlying.contractType) {
        case KYC_UNDERLYING_DEFAULT: {
          return this.#withdrawalMetadata(
            "kyc-default",
            pool,
            tokenIn,
            tokenOut,
            false,
          );
        }
        case KYC_UNDERLYING_ON_DEMAND:
          return {
            zapper: undefined,
            approveTarget: undefined,
            permissible: false,
            type: "kyc-on-demand",
          };
      }
    }

    return this.#withdrawalMetadata("classic", pool, tokenIn, tokenOut, true);
  }

  /**
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

    // fall zappers tokenOut (since withdrawing is allowed from any asset)
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
      // TODO: instead of permissible, return permitType зависимости от tokenIn
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
      // TODO: instead of permissible, return permitType зависимости от tokenIn
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

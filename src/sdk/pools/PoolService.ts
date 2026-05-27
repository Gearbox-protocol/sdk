import type { Address } from "viem";
import { ierc20Abi } from "../../abi/iERC20.js";
import {
  BaseContract,
  RWA_UNDERLYING_DEFAULT,
  RWA_UNDERLYING_ON_DEMAND,
  SDKConstruct,
  type TokenMetaData,
} from "../base/index.js";
import { NATIVE_ADDRESS } from "../constants/index.js";
import type { ZapperData } from "../market/index.js";
import {
  IERC20ZapperDepositsContract,
  IETHZapperDepositsContract,
  IZapperContract,
} from "../market/zapper/index.js";
import { AddressSet, hexEq } from "../utils/index.js";
import type {
  AddLiquidityProps,
  DepositMetadata,
  IPoolsService,
  PoolServiceCallResult,
  RemoveLiquidityProps,
  WithdrawalMetadata,
} from "./types.js";

export class PoolService extends SDKConstruct implements IPoolsService {
  /**
   * {@inheritDoc IPoolsService.getDepositTokensIn}
   */
  public getDepositTokensIn(pool: Address): Address[] {
    const underlying = this.#describeUnderlying(pool);
    if (this.sdk.tokensMeta.isRWAUnderlying(underlying)) {
      switch (underlying.contractType) {
        case RWA_UNDERLYING_DEFAULT:
          return this.#depositTokensIn(pool, false);
        case RWA_UNDERLYING_ON_DEMAND:
          return [underlying.asset];
      }
    }

    // Classic pool flow: allow direct underlying deposits and zapper-based deposits.
    return this.#depositTokensIn(pool, true);
  }

  /**
   * {@inheritDoc IPoolsService.getDepositTokensOut}
   */
  public getDepositTokensOut(pool: Address, tokenIn: Address): Address[] {
    const underlying = this.#describeUnderlying(pool);

    if (this.sdk.tokensMeta.isRWAUnderlying(underlying)) {
      switch (underlying.contractType) {
        case RWA_UNDERLYING_DEFAULT:
          return this.#depositTokensOut(pool, tokenIn, false);
        case RWA_UNDERLYING_ON_DEMAND:
          return [];
      }
    }

    // Classic pool flow: allow direct underlying deposits and zapper-based deposits.
    return this.#depositTokensOut(pool, tokenIn, true);
  }

  /**
   * {@inheritDoc IPoolsService.getDepositMetadata}
   */
  public getDepositMetadata(
    pool: Address,
    tokenIn: Address,
    tokenOut?: Address,
  ): DepositMetadata {
    const underlying = this.#describeUnderlying(pool);

    if (this.sdk.tokensMeta.isRWAUnderlying(underlying)) {
      switch (underlying.contractType) {
        case RWA_UNDERLYING_DEFAULT: {
          return this.#depositMetadata(
            "rwa-default",
            pool,
            tokenIn,
            tokenOut,
            false,
          );
        }
        case RWA_UNDERLYING_ON_DEMAND:
          return {
            zapper: undefined,
            approveTarget: underlying.liquidityProvider.addr,
            permissible: false,
            type: "rwa-on-demand",
          };
      }
    }

    return this.#depositMetadata("classic", pool, tokenIn, tokenOut, true);
  }

  /**
   * {@inheritDoc IPoolsService.addLiquidity}
   */
  public addLiquidity(
    props: AddLiquidityProps,
  ): PoolServiceCallResult | undefined {
    const { collateral, meta, permit, referralCode, pool, wallet } = props;

    const underlying = this.#describeUnderlying(pool);

    if (this.sdk.tokensMeta.isRWAUnderlying(underlying)) {
      if (underlying.contractType === RWA_UNDERLYING_ON_DEMAND) {
        return undefined;
      }
    }

    const { zapper } = meta;
    if (zapper && hexEq(zapper.tokenIn.addr, NATIVE_ADDRESS)) {
      const zapperContract = new IETHZapperDepositsContract(this.sdk, {
        addr: zapper.baseParams.addr,
        name: `ETHZapper(${this.labelAddress(zapper.baseParams.addr)})`,
      });
      const tx = zapperContract.depositWithReferral(wallet, referralCode ?? 0n);
      tx.value = collateral.balance.toString();
      return {
        tx,
        calls: [{ target: zapper.baseParams.addr, callData: tx.callData }],
      };
    } else if (zapper) {
      const zapperContract = new IERC20ZapperDepositsContract(this.sdk, {
        addr: zapper.baseParams.addr,
        name: `ERC20Zapper(${this.labelAddress(zapper.baseParams.addr)})`,
      });
      const tx = permit
        ? zapperContract.depositWithReferralAndPermit(
            collateral.balance,
            wallet,
            referralCode ?? 0n,
            permit.deadline,
            permit.v,
            permit.r,
            permit.s,
          )
        : zapperContract.depositWithReferral(
            collateral.balance,
            wallet,
            referralCode ?? 0n,
          );
      return {
        tx,
        calls: [{ target: zapper.baseParams.addr, callData: tx.callData }],
      };
    }

    const poolContract = this.sdk.marketRegister.findByPool(pool).pool.pool;
    const tx = poolContract.depositWithReferral(
      collateral.balance,
      wallet,
      referralCode ?? 0n,
    );
    return {
      tx,
      calls: [{ target: pool, callData: tx.callData }],
    };
  }

  /**
   * {@inheritDoc IPoolsService.getWithdrawalTokensIn}
   */
  public getWithdrawalTokensIn(pool: Address): Address[] {
    const underlying = this.#describeUnderlying(pool);
    if (this.sdk.tokensMeta.isRWAUnderlying(underlying)) {
      switch (underlying.contractType) {
        case RWA_UNDERLYING_DEFAULT:
          return this.#withdrawalTokensIn(pool, false);
        case RWA_UNDERLYING_ON_DEMAND:
          return [];
      }
    }

    // Classic pool flow: allow direct diesel-token redemption and zapper-based redemption.
    return this.#withdrawalTokensIn(pool, true);
  }

  /**
   * {@inheritDoc IPoolsService.getWithdrawalTokensOut}
   */
  public getWithdrawalTokensOut(pool: Address, tokenIn: Address): Address[] {
    const underlying = this.#describeUnderlying(pool);
    if (this.sdk.tokensMeta.isRWAUnderlying(underlying)) {
      switch (underlying.contractType) {
        case RWA_UNDERLYING_DEFAULT:
          return this.#withdrawalTokensOut(pool, tokenIn, false);
        case RWA_UNDERLYING_ON_DEMAND:
          return [underlying.asset];
      }
    }

    // Classic pool flow: allow direct diesel-token redemption and zapper-based redemption.
    return this.#withdrawalTokensOut(pool, tokenIn, true);
  }

  /**
   * {@inheritDoc IPoolsService.removeLiquidity}
   */
  public removeLiquidity(props: RemoveLiquidityProps): PoolServiceCallResult {
    const { pool, amount, meta, wallet, permit } = props;

    const underlying = this.#describeUnderlying(pool);
    if (this.sdk.tokensMeta.isRWAUnderlying(underlying)) {
      if (underlying.contractType === RWA_UNDERLYING_ON_DEMAND) {
        // in this flow, withdrawal === set allowance to 0
        const tokenContract = new BaseContract(this.sdk, {
          addr: underlying.asset,
          abi: ierc20Abi,
          name: "ERC20",
        });
        const tx = tokenContract.createRawTx({
          functionName: "approve",
          args: [underlying.liquidityProvider.addr, 0n],
        });
        return {
          tx,
          calls: [{ target: underlying.asset, callData: tx.callData }],
        };
      }
    }

    if (meta.zapper) {
      const zapperContract = new IZapperContract(this.sdk, {
        addr: meta.zapper.baseParams.addr,
        name: `Zapper(${this.labelAddress(meta.zapper.baseParams.addr)})`,
      });
      const tx = permit
        ? zapperContract.redeemWithPermit(
            amount,
            wallet,
            permit.deadline,
            permit.v,
            permit.r,
            permit.s,
          )
        : zapperContract.redeem(amount, wallet);
      return {
        tx,
        calls: [{ target: meta.zapper.baseParams.addr, callData: tx.callData }],
      };
    }

    const poolContract = this.sdk.marketRegister.findByPool(pool).pool.pool;
    const tx = poolContract.redeem(amount, wallet, wallet);
    return {
      tx,
      calls: [{ target: pool, callData: tx.callData }],
    };
  }

  /**
   * {@inheritDoc IPoolsService.getWithdrawalMetadata}
   */
  public getWithdrawalMetadata(
    pool: Address,
    tokenIn: Address,
    tokenOut?: Address,
  ): WithdrawalMetadata {
    const underlying = this.#describeUnderlying(pool);

    if (this.sdk.tokensMeta.isRWAUnderlying(underlying)) {
      switch (underlying.contractType) {
        case RWA_UNDERLYING_DEFAULT: {
          return this.#withdrawalMetadata(
            "rwa-default",
            pool,
            tokenIn,
            tokenOut,
            false,
          );
        }
        case RWA_UNDERLYING_ON_DEMAND:
          return {
            zapper: undefined,
            approveTarget: undefined,
            permissible: false,
            type: "rwa-on-demand",
          };
      }
    }

    return this.#withdrawalMetadata("classic", pool, tokenIn, tokenOut, true);
  }

  /**
   * Returns non-migration zappers available for the pool.
   */
  #getDepositZappers(poolAddr: Address) {
    const zappers = this.sdk.marketRegister.poolZappers(poolAddr);
    return zappers.filter(z => z.type !== "migration");
  }

  /**
   * Returns all supported deposit input tokens for a pool.
   *
   * Includes:
   * - zapper `tokenIn` where zapper output is pool diesel token
   * - pool underlying token when direct deposit is enabled
   */
  #depositTokensIn(poolAddr: Address, allowDirectDeposit: boolean): Address[] {
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);
    const result = new AddressSet();

    if (allowDirectDeposit) {
      result.add(pool.underlying);
    }

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

  /**
   * Returns all supported withdrawal input tokens for a pool.
   *
   * Includes:
   * - pool diesel token when direct withdrawal is enabled
   * - all zapper that can be redeemed from the pool
   */
  #withdrawalTokensIn(
    poolAddr: Address,
    allowDirectDeposit: boolean,
  ): Address[] {
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);

    const result: AddressSet = new AddressSet();

    // Direct withdrawal uses pool token (diesel token) as input.
    if (allowDirectDeposit && pool) {
      result.add(poolAddr);
    }

    // Any zapper output token can be used as a withdrawal input route.
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

  /**
   * Returns possible deposit outputs for a given input token.
   *
   * Includes:
   * - zapper `tokenOut` for `z.tokenIn` matching `tokenIn`
   * - pool diesel token for direct underlying deposit when enabled
   */
  #depositTokensOut(
    poolAddr: Address,
    tokenIn: Address,
    allowDirectDeposit: boolean,
  ): Address[] {
    const result = new AddressSet();
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);

    // Collect zapper outputs for the provided input token.
    const zappers = this.#getDepositZappers(poolAddr);
    for (const z of zappers) {
      if (hexEq(z.tokenIn.addr, tokenIn)) {
        result.add(z.tokenOut.addr);
      }
    }

    // Direct deposit mints pool token (diesel token).
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

  /**
   * Returns possible withdrawal outputs for a given input token.
   *
   * Includes:
   * - zapper `tokenIn` where zapper `z.tokenOut` matches requested `tokenIn`
   * - pool underlying token for direct diesel-token redemption when enabled
   */
  #withdrawalTokensOut(
    poolAddr: Address,
    tokenIn: Address,
    allowDirectDeposit: boolean,
  ): Address[] {
    const result = new AddressSet();
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);

    // Find reverse zapper route: requested output must match zapper output.
    const zappers = this.#getDepositZappers(poolAddr);
    for (const z of zappers) {
      if (hexEq(z.tokenOut.addr, tokenIn)) {
        result.add(z.tokenIn.addr);
      }
    }

    // Direct withdrawal from diesel token returns the underlying token.
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
   * Returns a single non-migration zapper route for the given token pair.
   *
   * Throws when multiple matching zappers exist to keep call construction deterministic.
   */
  #getDepositZapper(
    poolAddr: Address,
    tokenIn: Address,
    tokenOut: Address,
  ): ZapperData | undefined {
    const zappers = this.sdk.marketRegister
      .getZapper(poolAddr, tokenIn, tokenOut)
      ?.filter(z => z.type !== "migration");

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

  /**
   * Builds metadata required to execute a deposit operation.
   *
   * Includes selected zapper route (if any), approve target, and permit support flag.
   */
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
      // Approval target is zapper when routed, otherwise the pool contract.
      approveTarget: zapper?.baseParams.addr ?? pool.pool.address,
      permissible: !!zapper && !hexEq(tokenIn, NATIVE_ADDRESS),
      type,
    };
  }

  /**
   * Builds metadata required to execute a withdrawal operation.
   *
   * Includes selected zapper route (if any), approve target, and permit support flag.
   */
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
      // Approval target exists only for zapper-based withdrawals.
      approveTarget: zapper?.baseParams.addr,
      permissible: !!zapper,
      type,
    };
  }

  #describeUnderlying(pool: Address): TokenMetaData {
    const market = this.sdk.marketRegister.findByPool(pool);
    return this.sdk.tokensMeta.mustGet(market.underlying);
  }
}

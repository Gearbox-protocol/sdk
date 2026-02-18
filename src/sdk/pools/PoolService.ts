import type { Address } from "viem";
import { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
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
import {
  AddressMap,
  AddressSet,
  AP_PERIPHERY_COMPRESSOR,
  hexEq,
  VERSION_RANGE_310,
} from "../index.js";
import { extraZappers } from "./extraZappers.js";
import type {
  AddLiquidityProps,
  DepositMetadata,
  IPoolsService,
  PoolServiceCall,
  RemoveLiquidityProps,
  ZapperData,
} from "./types.js";

const NATIVE_ADDRESS: Address = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export class PoolService extends SDKConstruct implements IPoolsService {
  #zappers?: AddressMap<ZapperData[]>;

  public get zappers(): AddressMap<ZapperData[]> {
    if (!this.#zappers) {
      throw new Error("zappers not loaded, call loadZappers first");
    }
    return this.#zappers;
  }

  public async loadZappers(force?: boolean): Promise<void> {
    if (!force && this.#zappers) {
      return;
    }

    const [pcAddr] = this.sdk.addressProvider.mustGetLatest(
      AP_PERIPHERY_COMPRESSOR,
      VERSION_RANGE_310,
    );
    this.logger?.debug(`loading zappers with periphery compressor ${pcAddr}`);
    const markets = this.sdk.marketRegister.markets;
    const resp = await this.client.multicall({
      contracts: markets.map(
        m =>
          ({
            abi: peripheryCompressorAbi,
            address: pcAddr,
            functionName: "getZappers",
            args: [m.configurator.address, m.pool.pool.address],
          }) as const,
      ),
      allowFailure: true,
      batchSize: 0,
    });

    this.#zappers = new AddressMap<ZapperData[]>(undefined, "zappers");
    for (let i = 0; i < resp.length; i++) {
      const { status, result, error } = resp[i];
      const marketConfigurator = markets[i].configurator.address;
      const pool = markets[i].pool.pool.address;

      if (status === "success") {
        for (const z of result) {
          this.#addZapper({ ...z, pool });
        }
      } else {
        this.sdk.logger?.error(
          `failed to load zapper for market configurator ${this.labelAddress(
            marketConfigurator,
          )} and pool ${this.labelAddress(pool)}: ${error}`,
        );
      }
    }

    for (const z of extraZappers[this.networkType] ?? []) {
      this.#addZapper(z);
    }
  }

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
          return this.#depositMetadata(pool, tokenIn, tokenOut, false);
        }
        case KYC_UNDERLYING_ON_DEMAND:
          return {
            zapper: undefined,
            approveTarget: underlying.liquidityProvider,
            permissible: false,
          };
      }
    }

    return this.#depositMetadata(pool, tokenIn, tokenOut, true);
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
    if (zapper?.tokenIn.addr === NATIVE_ADDRESS) {
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

  public removeLiquidity(props: RemoveLiquidityProps): PoolServiceCall {
    const { pool, amount, account, zapper, permit } = props;

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

    if (zapper) {
      return permit
        ? {
            target: zapper.zapper,
            abi: iZapperAbi,
            functionName: "redeemWithPermit",
            args: [
              amount,
              account,
              permit.deadline,
              permit.v,
              permit.r,
              permit.s,
            ],
          }
        : {
            target: zapper.zapper,
            abi: iZapperAbi,
            functionName: "redeem",
            args: [amount, account],
          };
    }

    return {
      target: pool,
      abi: iPoolV300Abi,
      functionName: "redeem",
      args: [amount, account, account],
    };
  }

  #depositTokensIn(poolAddr: Address, allowDirectDeposit: boolean): Address[] {
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);
    const result: AddressSet = new AddressSet();

    if (allowDirectDeposit) {
      result.add(pool.underlying);
    }

    // find all zappers that produce pool.dieselToken (=== pool.address)
    const zappers = this.zappers.get(poolAddr) ?? [];
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

  #depositTokensOut(
    poolAddr: Address,
    tokenIn: Address,
    allowDirectDeposit: boolean,
  ): Address[] {
    const result = new AddressSet();
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);

    // find all zappers by tokenIn, get their tokenOuts
    const zappers = this.zappers.get(poolAddr) ?? [];
    for (const z of zappers) {
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
        `No tokensOut found for tokenIn ${this.labelAddress(tokenIn)} on pool ${this.labelAddress(poolAddr)}`,
      );
    }

    return result.asArray();
  }

  #depositMetadata(
    poolAddr: Address,
    tokenIn: Address,
    tokenOut?: Address,
    allowDirectDeposit?: boolean,
  ): DepositMetadata {
    if (!tokenOut) {
      throw new Error("tokenOut is required for classic pool deposit");
    }
    const { pool } = this.sdk.marketRegister.findByPool(poolAddr);

    const zapper = this.#getZapper(poolAddr, tokenIn, tokenOut);
    if (!zapper && !allowDirectDeposit) {
      throw new Error(
        `No zapper found for tokenIn ${this.labelAddress(tokenIn)} and tokenOut ${this.labelAddress(tokenOut)} on pool ${this.labelAddress(poolAddr)}`,
      );
    }

    return {
      zapper,
      // zapper or pool itself
      approveTarget: zapper?.baseParams.addr ?? pool.pool.address,
      // TODO: instead of permissible, return permitType зависимости от tokenIn
      // "none" | "eip2612" | "dai_like";
      permissible: !!zapper && tokenIn !== NATIVE_ADDRESS,
    };
  }

  #getZapper(
    pool: Address,
    tokenIn: Address,
    tokenOut: Address,
  ): ZapperData | undefined {
    return this.zappers
      .get(pool)
      ?.find(
        z => hexEq(z.tokenIn.addr, tokenIn) && hexEq(z.tokenOut.addr, tokenOut),
      );
  }

  #addZapper(z: ZapperData): void {
    const existing = this.zappers.get(z.pool);
    if (existing) {
      const hasZapper = existing.some(zz =>
        hexEq(zz.baseParams.addr, z.baseParams.addr),
      );
      if (!hasZapper) {
        existing.push(z);
      }
    } else {
      this.zappers.upsert(z.pool, [z]);
    }
    const zappersTokens = [z.tokenIn, z.tokenOut];
    for (const t of zappersTokens) {
      this.sdk.tokensMeta.upsert(t.addr, t);
      this.sdk.setAddressLabel(t.addr, t.symbol);
    }
  }

  #describeUnderlying(pool: Address): TokenMetaData {
    const market = this.sdk.marketRegister.findByPool(pool);
    return this.sdk.tokensMeta.mustGet(market.underlying);
  }
}

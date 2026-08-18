import type { Address } from "viem";
import { iRWAFactoryAbi } from "../../../abi/rwa/iRWAFactory.js";
import type {
  DelayedReceivedAsset,
  StrategyPosition,
} from "../../../model/index.js";
import type { CreditAccountData } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import {
  ADDRESS_0X0,
  AP_CREDIT_ACCOUNT_COMPRESSOR,
  DUST_THRESHOLD,
  MAX_UINT256,
  VERSION_RANGE_310,
} from "../../constants/index.js";
import { dominantCollateral } from "../../market/index.js";
import {
  calcBorrowApy,
  calcPositionLeverage,
  healthFactorBps,
  usdToNumber,
} from "../../market/math.js";
import { accountSnapshotFromCreditAccountData } from "../../positions/index.js";
import { AddressMap, AddressSet, hexEq } from "../../utils/index.js";
import { simulateWithPriceUpdates } from "../../utils/viem/index.js";
import type {
  ClaimableWithdrawal,
  PendingWithdrawal,
  WithdrawalOutput,
} from "../withdrawal-compressor/index.js";
import { CreditAccountCompressorV310Contract } from "./CreditAccountCompressorV310Contract.js";
import type {
  CreditAccountFilter,
  CreditManagerFilter,
  GetCreditAccountsOptions,
  ListStrategyPositionsProps,
} from "./types.js";

/**
 * Reads credit accounts of the current chain.
 *
 * Stitches the credit account compressor together with the RWA factories (for
 * accounts owned via an investor EOA) and with the withdrawal compressor (for
 * assets that are on their way out of an account), and describes the result
 * either as raw account data or as {@link StrategyPosition}s.
 *
 * TODO: create and deploy new compressor contract onchain to avoid all this stitching
 **/
export class CreditAccountCompressor extends SDKConstruct {
  /**
   * Reads data of a single credit account.
   *
   * When the compressor cannot value the account with current prices, the read
   * is retried with price feed updates applied.
   *
   * @param account - Credit account address.
   * @param blockNumber - Block to read at, defaults to the latest block.
   * @returns Account data, or `undefined` if the account does not exist.
   **/
  public async getCreditAccountData(
    account: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountData<true> | undefined> {
    const contract = this.#contract;
    const raw = await contract.getCreditAccountData(account, blockNumber);
    if (!raw) {
      return undefined;
    }
    const marketSuite = this.sdk.marketRegister.findByCreditManager(
      raw.creditManager,
    );
    const factory = marketSuite.rwaFactory;

    let ca: CreditAccountData;
    let investor: Address | undefined;
    if (raw.success) {
      ca = raw;
      investor = await factory?.getInvestor(raw.creditAccount, false);
    } else {
      const { txs: priceUpdateTxs } =
        await marketSuite.priceOracle.priceUpdateTxsForAccount(raw);
      [ca, investor] = (await simulateWithPriceUpdates(this.client, {
        priceUpdates: priceUpdateTxs,
        contracts: [
          contract.dataCall(account),
          ...(factory
            ? [
                {
                  abi: iRWAFactoryAbi,
                  address: factory.address,
                  functionName: "getInvestor",
                  args: [raw.creditAccount],
                },
              ]
            : []),
        ] as any,
        blockNumber,
        gas: this.sdk.gasLimit,
      })) as [CreditAccountData, Address | undefined];
    }

    return { ...ca, investor };
  }

  /**
   * Reads all credit accounts matching the options, sorted by health factor
   * ascending.
   *
   * @param options - {@link GetCreditAccountsOptions}
   * @param blockNumber - Block to read at, defaults to the latest block.
   **/
  public async getCreditAccounts(
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
  ): Promise<CreditAccountData[]> {
    const {
      creditManager,
      includeZeroDebt = false,
      maxHealthFactor = MAX_UINT256,
      minHealthFactor = 0n,
      owner = ADDRESS_0X0,
      ignoreReservePrices = false,
    } = options ?? {};
    // either credit manager or all attached markets
    const target =
      creditManager ??
      ({
        configurators: this.#marketConfigurators,
        creditManagers: [],
        pools: [],
        underlying: ADDRESS_0X0,
      } as CreditManagerFilter);

    const { txs: priceUpdateTxs } =
      await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(
        ignoreReservePrices ? { main: true } : undefined,
      );

    const allCAs = await this.#contract.getCreditAccounts(
      target,
      { owner, includeZeroDebt, minHealthFactor, maxHealthFactor },
      { blockNumber, priceUpdateTxs },
    );

    // sort by health factor ascending
    return allCAs.sort((a, b) => Number(a.healthFactor - b.healthFactor));
  }

  /**
   * Reads all credit accounts of a borrower, sorted by health factor
   * ascending.
   *
   * Covers accounts the borrower owns directly and RWA accounts they own as an
   * investor, which are owned on-chain by an RWA factory.
   *
   * @param borrower - Wallet address.
   * @param options - {@link GetCreditAccountsOptions}
   * @param blockNumber - Block to read at, defaults to the latest block.
   **/
  public async getBorrowerCreditAccounts(
    borrower: Address,
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
  ): Promise<CreditAccountData<true>[]> {
    const {
      creditManager,
      includeZeroDebt = false,
      maxHealthFactor = MAX_UINT256,
      minHealthFactor = 0n,
      ignoreReservePrices = false,
    } = options ?? {};

    const { txs: priceUpdateTxs } =
      await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(
        ignoreReservePrices ? { main: true } : undefined,
      );

    // 1. Discover RWA credit accounts for this borrower across all factories
    const investorDataList = await this.sdk.rwa.getInvestorData(
      borrower,
      undefined,
      blockNumber,
    );
    const rwaAccountAddresses: Address[] = investorDataList.flatMap(d =>
      d.creditAccounts.map(ca => ca.creditAccount),
    );

    // 2. Build a single multicall:
    //    - getCreditAccountData for each RWA account
    //    - getCreditAccounts(borrower, reverting=false)
    //    - getCreditAccounts(borrower, reverting=true)
    const cmFilter: CreditManagerFilter = creditManager
      ? {
          configurators: [],
          creditManagers: [creditManager],
          pools: [],
          underlying: ADDRESS_0X0,
        }
      : {
          configurators: this.#marketConfigurators,
          creditManagers: [],
          pools: [],
          underlying: ADDRESS_0X0,
        };

    const permissiveFilter: CreditAccountFilter = {
      owner: borrower,
      includeZeroDebt: true,
      minHealthFactor: 0n,
      maxHealthFactor: MAX_UINT256,
      reverting: false,
    };

    const contract = this.#contract;
    const rwaContracts = rwaAccountAddresses.map(account =>
      contract.dataCall(account),
    );

    const getCreditAccountsContracts = [false, true].map(reverting =>
      contract.accountsCall([cmFilter, { ...permissiveFilter, reverting }, 0n]),
    );

    const allContracts = [...rwaContracts, ...getCreditAccountsContracts];

    const results = await simulateWithPriceUpdates(this.client, {
      priceUpdates: priceUpdateTxs,
      contracts: allContracts,
      blockNumber,
      gas: this.sdk.gasLimit,
    });

    // 3. Split results back
    const rwaResults = results.slice(
      0,
      rwaAccountAddresses.length,
    ) as Array<CreditAccountData>;
    // the two `getCreditAccounts` results, which viem types after the
    // `getCreditAccountData` calls they are batched with
    const normalResults = results.slice(
      rwaAccountAddresses.length,
    ) as unknown as Array<[CreditAccountData[], bigint]>;

    // 4. Assemble with investor
    const seen = new AddressSet();
    const allCAs: CreditAccountData<true>[] = [];

    for (const ca of rwaResults) {
      if (!seen.has(ca.creditAccount)) {
        seen.add(ca.creditAccount);
        allCAs.push({ ...ca, investor: borrower });
      }
    }

    for (const [accounts] of normalResults) {
      for (const ca of accounts) {
        if (!seen.has(ca.creditAccount)) {
          seen.add(ca.creditAccount);
          allCAs.push({ ...ca, investor: undefined });
        }
      }
    }

    // 5. Apply remaining TS-side filters
    const filtered = allCAs.filter(ca => {
      if (!includeZeroDebt && ca.debt === 0n) return false;
      if (ca.healthFactor < minHealthFactor) return false;
      if (ca.healthFactor > maxHealthFactor) return false;
      if (creditManager && !hexEq(ca.creditManager, creditManager))
        return false;
      return true;
    });

    this.logger?.debug(
      `loaded ${allCAs.length} borrower credit accounts (${rwaResults.length} RWA, ${filtered.length} after filter)`,
    );

    return filtered.sort((a, b) => Number(a.healthFactor - b.healthFactor));
  }

  /**
   * Describes all credit accounts of a wallet as strategy positions.
   *
   * @param props - {@link ListStrategyPositionsProps}
   **/
  public async listPositions(
    props: ListStrategyPositionsProps,
  ): Promise<StrategyPosition[]> {
    const { owner, includeZeroDebt, blockNumber } = props;
    // phantom token lookups below are sync; the cache is populated by attach/hydrate
    const accounts = await this.getBorrowerCreditAccounts(
      owner,
      { includeZeroDebt },
      blockNumber,
    );

    const describable = accounts.filter(ca => {
      // collateral computation reverted (e.g. dead price feed) — none of the
      // account's amounts can be computed, so it is left out of the list
      if (!ca.success) {
        this.logger?.warn(
          `cannot describe position of ${this.labelAddress(ca.creditAccount)}: collateral computation failed`,
        );
      }
      return ca.success;
    });

    const withdrawals = await Promise.all(
      describable.map(ca => this.#accountWithdrawals(ca, blockNumber)),
    );

    return describable.map((ca, i) =>
      this.#toStrategyPosition(ca, withdrawals[i] ?? new AddressMap()),
    );
  }

  /**
   * Builds one strategy position from an account snapshot.
   *
   * @param withdrawals - Delayed withdrawals of the account, keyed by the
   * phantom token that represents them on it.
   **/
  #toStrategyPosition(
    ca: CreditAccountData,
    withdrawals: AddressMap<DelayedReceivedAsset[]>,
  ): StrategyPosition {
    const suite = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const { market } = suite;
    const { priceOracle } = market;
    const { pool } = market.pool;

    // for RWA markets, amounts are denominated in the unwrapped asset
    // (e.g. USDC instead of dcUSDC); the wrapped underlying converts 1:1
    const token = this.sdk.tokensMeta.mustGetToken(market.unwrappedUnderlying);
    const totalDebtValue = ca.debt + ca.accruedInterest + ca.accruedFees;
    const collateral = dominantCollateral(ca, market);

    // healthFactor / leverage / borrowApy / netApy keep their existing
    // sources; only the fields the position does not have natively are filled
    const snapshot = accountSnapshotFromCreditAccountData(ca);
    const borrowRate = this.sdk.positions.borrowRate(snapshot);
    const timeToLiquidation = this.sdk.positions.timeToLiquidation(snapshot);
    const liquidationPrice = this.sdk.positions.liquidationPrice(snapshot);

    return {
      kind: "strategy",
      chainId: this.sdk.chainId,
      creditManager: ca.creditManager,
      creditAccount: ca.creditAccount,
      name: collateral ? suite.strategyName(collateral) : token.symbol,
      // the read model asks for the collateral the position was opened into,
      // which needs its history; the chain can only tell what it holds now
      targetCollateral: collateral
        ? this.sdk.tokensMeta.mustGetToken(collateral)
        : null,
      leverage: calcPositionLeverage(ca.totalValue, totalDebtValue),
      borrowApy: calcBorrowApy(
        pool.baseInterestRate,
        suite.creditManager.feeInterest,
      ),
      // the compressor prices the whole account in one pass, so the USD values
      // of the two totals come from it rather than from a second price lookup
      totalDebt: {
        token,
        value: totalDebtValue,
        valueUsd: usdToNumber(ca.totalDebtUSD),
      },
      totalValue: {
        token,
        value: ca.totalValue,
        valueUsd: usdToNumber(ca.totalValueUSD),
      },
      healthFactor: healthFactorBps(ca.healthFactor),
      borrowRate,
      timeToLiquidation,
      liquidationPrice,
      collaterals: ca.tokens.flatMap(t => {
        if (
          (t.mask & ca.enabledTokensMask) === 0n ||
          t.balance <= DUST_THRESHOLD
        ) {
          return [];
        }
        return [
          {
            // phantom tokens are reported as themselves, the asset they
            // redeem into shows up in `withdrawals`
            collateral: priceOracle.toTokenAmount(t.token, t.balance),
            quota: priceOracle.toTokenAmount(market.underlying, t.quota),
            withdrawals: withdrawals.get(t.token) ?? [],
          },
        ];
      }),
    };
  }

  /**
   * Delayed withdrawals of one account, keyed by the phantom token that
   * represents them on it, so that each collateral row can pick up its own.
   **/
  async #accountWithdrawals(
    ca: CreditAccountData,
    blockNumber?: bigint,
  ): Promise<AddressMap<DelayedReceivedAsset[]>> {
    const compressor = this.sdk.withdrawalCompressor;
    const byPhantomToken = new AddressMap<DelayedReceivedAsset[]>(
      undefined,
      "accountWithdrawals",
    );
    // an account with no phantom token balance has nothing on its way out, and
    // asking the compressor about it would be one RPC call per such account
    const holdsPhantomToken = ca.tokens.some(
      t =>
        t.balance > DUST_THRESHOLD &&
        compressor?.getWithdrawalSourceToken(t.token) !== undefined,
    );
    if (!compressor || !holdsPhantomToken) {
      return byPhantomToken;
    }
    const { priceOracle } = this.sdk.marketRegister.findByCreditManager(
      ca.creditManager,
    );
    const { claimable, pending } = await compressor.getCurrentWithdrawals(
      ca.creditAccount,
      blockNumber,
    );

    const add = (
      w: ClaimableWithdrawal | PendingWithdrawal,
      outputs: readonly WithdrawalOutput[],
      claimableAt?: bigint,
    ): void => {
      const assets = outputs.map(
        (o): DelayedReceivedAsset => ({
          isDelayed: true,
          ...priceOracle.toTokenAmount(o.token, o.amount),
          redeemer: w.redeemer,
          claimableAt:
            claimableAt === undefined ? undefined : Number(claimableAt),
        }),
      );
      byPhantomToken.upsert(w.withdrawalPhantomToken, [
        ...(byPhantomToken.get(w.withdrawalPhantomToken) ?? []),
        ...assets,
      ]);
    };

    for (const w of claimable) {
      add(w, w.outputs);
    }
    for (const w of pending) {
      add(w, w.expectedOutputs, w.claimableAt);
    }
    return byPhantomToken;
  }

  /**
   * Credit account compressor contract of the current chain.
   *
   * Resolved on every access, because the address provider is only populated
   * once the SDK is attached or hydrated. The contracts register acts as the
   * cache: instances register themselves there on construction, and a
   * re-hydrated SDK with a different compressor address simply misses and
   * builds a new wrapper.
   **/
  get #contract(): CreditAccountCompressorV310Contract {
    const [address] = this.sdk.addressProvider.mustGetLatest(
      AP_CREDIT_ACCOUNT_COMPRESSOR,
      VERSION_RANGE_310,
    );
    const compressor =
      this.sdk.getContract<CreditAccountCompressorV310Contract>(address);
    return (
      compressor ?? new CreditAccountCompressorV310Contract(this.sdk, address)
    );
  }

  /**
   * Addresses of market configurators the SDK is attached to.
   **/
  get #marketConfigurators(): Address[] {
    return this.sdk.marketRegister.marketConfigurators.map(mc => mc.address);
  }
}

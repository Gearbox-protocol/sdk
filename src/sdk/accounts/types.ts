import type {
  Address,
  ContractFunctionArgs,
  GetContractReturnType,
  Hex,
  PublicClient,
} from "viem";
import type { creditAccountCompressorAbi } from "../../abi/compressors/creditAccountCompressor.js";
import type { iWithdrawalCompressorV310Abi } from "../../abi/IWithdrawalCompressorV310.js";
import type {
  ConnectedBotData,
  Construct,
  CreditAccountData,
} from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type {
  CreditSuite,
  OnDemandPriceUpdates,
  PriceUpdateV300,
  PriceUpdateV310,
  UpdatePriceFeedsResult,
} from "../market/index.js";
import type {
  Asset,
  CreditAccountTokensSlice,
  RouterCASlice,
  RouterCloseResult,
} from "../router/index.js";
import type { IPriceUpdateTx, MultiCall, RawTx } from "../types/index.js";

export type GetCreditAccountsArgs = ContractFunctionArgs<
  typeof creditAccountCompressorAbi,
  "pure" | "view",
  "getCreditAccounts"
>;

export interface CreditAccountFilter {
  owner: Address;
  includeZeroDebt: boolean;
  minHealthFactor: bigint;
  maxHealthFactor: bigint;
  reverting: boolean;
}

export interface CreditManagerFilter {
  configurators: readonly Address[];
  creditManagers: readonly Address[];
  pools: readonly Address[];
  underlying: Address;
}

export interface GetCreditAccountsOptions {
  creditManager?: Address;
  owner?: Address;
  includeZeroDebt?: boolean;
  minHealthFactor?: bigint;
  maxHealthFactor?: bigint;
  /**
   * If true, will filter out reserve price updates
   */
  ignoreReservePrices?: boolean;
}

export interface PriceUpdatesOptions {
  creditManager: Address;
  creditAccount?: CreditAccountTokensSlice;
  desiredQuotas?: Asset[];
  ignoreReservePrices?: boolean;
}

export interface CloseCreditAccountResult extends CreditAccountOperationResult {
  routerCloseResult: RouterCloseResult;
}

export interface FullyLiquidateResult extends CloseCreditAccountResult {
  lossPolicyData?: Hex;
}

export interface CreditAccountOperationResult {
  tx: RawTx;
  calls: Array<MultiCall>;
  creditFacade: CreditSuite["creditFacade"];
}

export interface CreditManagerOperationResult {
  calls: Array<MultiCall>;
  creditFacade: CreditSuite["creditFacade"];
}

export type CloseOptions = "close" | "zeroDebt";

export interface CloseCreditAccountProps {
  /**
   * Close or zeroDebt
   */
  operation: CloseOptions;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * Tokens to withdraw from credit account.
   * For credit account closing this is the underlying token, because during the closure,
   * all tokens on account are swapped into the underlying,
   * and only the underlying token will remain on the credit account
   */
  assetsToWithdraw: Array<Address>;
  /**
   * Wallet address to withdraw underlying to
   */
  to: Address;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage?: bigint;
  /**
   * Result of findBestClosePath method from router; if omited, calls marketRegister.findCreditManager {@link RouterCloseResult}
   */
  closePath?: RouterCloseResult;
}

export interface RepayCreditAccountProps
  extends RepayAndLiquidateCreditAccountProps {
  /**
   * Swap calls for repay
   */
  calls?: Array<MultiCall>;
  /**
   * close or zeroDebt
   */
  operation: CloseOptions;
}

export interface RepayAndLiquidateCreditAccountProps {
  /**
   * tokens to repay dept. 
      In the current implementation, this is the (debt+interest+fess) * buffer, 
      where buffer refers to amount of tokens which will exceed current debt 
      in order to cover possible debt increase over tx execution
   */
  collateralAssets: Array<Asset>;
  /**
   * tokens to withdraw from credit account. 
      Typically all non zero ca assets (including unclaimed rewards) 
      plus underlying token (to withdraw any exceeding underlying token after repay)
   */
  assetsToWithdraw: Array<Asset>;
  /**
   * minimal credit account data on which operation is performed on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * Wallet address to withdraw underlying to
   */
  to: Address;
  /**
   * permits of tokens to withdraw (in any permittable token is present)
   */
  permits: Record<string, PermitResult>;
  tokensToClaim: Asset[];
}

export interface PrepareUpdateQuotasProps {
  /**
   * average quota for desired token
   */
  averageQuota: Array<Asset>;
  /**
   * minimum quota for desired token
   */
  minQuota: Array<Asset>;
}

export interface UpdateQuotasProps extends PrepareUpdateQuotasProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export interface AddCollateralProps extends PrepareUpdateQuotasProps {
  /**
   * Asset to add as collateral
   */
  asset: Asset;
  /**
   * Native token amount to attach to tx
   */
  ethAmount: bigint;
  /**
   * Permit of collateral asset if it is permittable
   */
  permit: PermitResult | undefined;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export interface WithdrawCollateralProps extends PrepareUpdateQuotasProps {
  /**
   * list of assets which should be withdrawn
   */
  assetsToWithdraw: Array<Asset>;
  /**
   * Wallet address to withdraw token to
   */
  to: Address;
  /**
   * minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export type AccountToCheck = {
  creditAccount: Address;
  creditManager: Address;
};

export interface ExecuteSwapProps extends PrepareUpdateQuotasProps {
  /**
   * Array of MultiCall from router methods getSingleSwap or getAllSwaps
   */
  calls: Array<MultiCall>;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export interface PreviewDelayedWithdrawalProps {
  /**
   * Amount of source token (ex. cp0xlrt)
   */
  amount: bigint;
  /**
   * Address of source token (ex. cp0xlrt)
   */
  token: Address;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: Address;
}

export interface GetPendingWithdrawalsProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: Address;
}

type WithdrawalCompressorV310InstanceType = GetContractReturnType<
  typeof iWithdrawalCompressorV310Abi,
  PublicClient
>;

export type PreviewDelayedWithdrawalResult = Awaited<
  ReturnType<
    WithdrawalCompressorV310InstanceType["read"]["getWithdrawalRequestResult"]
  >
>;

type PendingWithdrawalResult = Awaited<
  ReturnType<
    WithdrawalCompressorV310InstanceType["read"]["getCurrentWithdrawals"]
  >
>;
export type PendingWithdrawal = PendingWithdrawalResult[1][number];
export type ClaimableWithdrawal = PendingWithdrawalResult[0][number];

export interface GetPendingWithdrawalsResult {
  claimableNow: Array<ClaimableWithdrawal>;
  pending: Array<PendingWithdrawal>;
}

export interface StartDelayedWithdrawalProps extends PrepareUpdateQuotasProps {
  /**
   * Withdrawal preview
   */
  preview: PreviewDelayedWithdrawalResult;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export interface ClaimDelayedProps extends PrepareUpdateQuotasProps {
  /**
   * assets claimable now from getPendingWithdrawals
   */
  claimableNow: GetPendingWithdrawalsResult["claimableNow"][number];
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export interface ClaimFarmRewardsProps extends PrepareUpdateQuotasProps {
  /**
    * Legacy property, v3.1 only enables token when quota is bought and when quota is bought token cannot be disabled. 
    * Tokens to disable after rewards claiming;
    sometimes is needed since old credit facade used to enable tokens on claim 
  */
  tokensToDisable: Array<Asset>;
  /**
   * Legacy property - array of MultiCall from getRewards
   */
  calls: Array<MultiCall>;
  /**
   * minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  tokensToClaim: Asset[];
  forceCalls?: boolean;
}

export interface EnableTokensProps {
  /**
   * List of tokens to disable
   */
  disabledTokens: Array<Address>;
  /**
   * List of tokens to enable
   */
  enabledTokens: Array<Address>;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export interface OpenCAProps extends PrepareUpdateQuotasProps {
  /**
   * Native token amount to attach to tx
   */
  ethAmount: bigint;
  /**
   * Array of collateral which can be just directly added or swapped using the path {@link Asset}
   */
  collateral: Array<Asset>;
  /**
   * Debt to open credit account with
   */
  debt: bigint;
  /**
   * Flag to withdraw debt to wallet after opening credit account;
   * used for borrowing functionality
   * If true, will withdraw underlying token, otherwise will withdraw specified token
   */
  withdrawToken?: boolean | Address;
  /**
   * Permits of collateral tokens (in any permittable token is present) {@link PermitResult}
   */
  permits: Record<string, PermitResult>;
  /**
   * Array of MultiCall from router methods findOpenStrategyPath {@link MultiCall}.
   * Used for trading and strategy functionality
   */
  calls: Array<MultiCall>;
  /**
   * Slot for optional call to execute after main tx.
   * For example: add bots
   */
  callsAfter?: Array<MultiCall>;
  /**
   * Address of credit manager to open credit account on
   */

  creditManager: Address;
  /**
   * Optional address of credit account to reopen
   */
  reopenCreditAccount?: Address;
  /**
   * Wallet address to transfer credit account to
   */
  to: Address;
  /**
   * Referral code to open credit account with
   */
  referralCode: bigint;
}

export interface ChangeDeptProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * Amount to change debt by
   * 0 - prohibited value;
   * negative value for debt decrease;
   * positive value for debt increase.
   */
  amount: bigint;
  /**
   * If true, will add collateral to the credit account
   */
  addCollateral: boolean;
}

export interface FullyLiquidateProps {
  /**
   * Credit account to liquidate
   */
  account: RouterCASlice;
  /**
   * Address to transfer underlying left after liquidation
   */
  to: Address;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage?: bigint;
  /**
   * TODO: legacy v3 option to remove
   */
  force?: boolean;
  /**
   * List of assets to keep on account after liquidation
   */
  keepAssets?: Address[];
  /**
   * If true, will ignore reserve prices
   */
  ignoreReservePrices?: boolean;
  /**
   * If true, will try to apply loss policy
   */
  applyLossPolicy?: boolean;
  /**
   * Debt only mode - will try to sell just enought of most valuable token to cover debt
   */
  debtOnly?: boolean;
}

export interface PermitResult {
  r: Address;
  s: Address;
  v: number;

  token: Address;
  owner: Address;
  spender: Address;
  value: bigint;

  deadline: bigint;
  nonce: bigint;
}

export interface Rewards {
  adapter: Address;
  stakedPhantomToken: Address;
  calls: Array<MultiCall>;

  rewards: Array<Asset>;
}

interface CMSlice {
  creditManager: Address;
  creditFacade: Address;
  type: "creditManager";
}

export interface SetBotProps {
  /**
   * Address of a bot that is being updated
   */
  botAddress: Address;
  /**
   * Permissions to set for the bot
   */
  permissions: bigint | null;
  /**
   * Minimal credit account data {@link RouterCASlice} on which operation is performed; if omitted, credit manager data is used
   * Minimal credit manager data {@link CMSlice} on which operation is performed; used only if credit account is omitted
   * At least one of credit account or credit manager must be provided
   */
  targetContract: (RouterCASlice & { type: "creditAccount" }) | CMSlice;
}

export type GetConnectedBotsResult = Array<
  | {
      error?: undefined;
      result: readonly ConnectedBotData[];
      status: "success";
    }
  | {
      error: Error;
      result?: undefined;
      status: "failure";
    }
>;

export type GetConnectedMigrationBotsResult =
  | {
      result: (
        | {
            error: Error;
            result?: undefined;
            status: "failure";
          }
        | {
            error?: undefined;
            result:
              | readonly [bigint, boolean, boolean]
              | readonly [bigint, boolean];
            status: "success";
          }
      )[];
      botAddress: Address;
    }
  | undefined;

export interface PreviewWithdrawLlamathenaProportionallyProps {
  llamathena: Asset;
}
export interface PreviewWithdrawLlamathenaProportionallyResult {
  /**
   * Assets to get
   */
  assets: [Asset];
  /**
   * Llamathena asset
   */
  stkLlamathena: [Asset];
}

export interface LlamathenaProportionalWithdrawProps
  extends PrepareUpdateQuotasProps {
  /**
   * Preview of the withdrawal
   */
  preview: PreviewWithdrawLlamathenaProportionallyResult;
  /**
   * minimal credit account data on which operation is performed on which operation is performed
   */
  creditAccount: RouterCASlice;
}

/**
 * Options to get approval address for collateral token
 */
export type GetApprovalAddressProps =
  | { creditManager: Address; borrower: Address }
  | {
      creditManager: Address;
      creditAccount: Address;
    };

export type CreditAccountDataWithInvestor = CreditAccountData & {
  investor: Address;
};

export interface ICreditAccountsService extends Construct {
  sdk: GearboxSDK;
  /**
   * Returns single credit account data, or undefined if it's not found
   * Performs all necessary price feed updates under the hood
   * @param account
   * @param blockNumber
   * @returns
   */
  getCreditAccountData(
    account: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountData | undefined>;

  /**
   * Returns credit account data for a single account with the investor address resolved (from KYC factory when applicable).
   * @param account - Credit account address
   * @param blockNumber - Optional block number for the read
   * @returns CreditAccountDataWithInvestor, or undefined if the account is not found
   */
  getCreditAccountDataWithInvestor(
    account: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountDataWithInvestor | undefined>;

  /**
   * Methods to get all credit accounts with some optional filtering
   * Performs all necessary price feed updates under the hood
   *
   * @param options
   * @param blockNumber
   * @param priceUpdate - Optional pre-computed price feed update (e.g. from generatePriceFeedsUpdateTxs)
   * @returns Credit accounts sorted by health factor ascending
   */
  getCreditAccounts(
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
    priceUpdate?: UpdatePriceFeedsResult,
  ): Promise<Array<CreditAccountData>>;

  /**
   * Returns all credit accounts matching the filter with investor set on each; when options.owner is set, includes KYC CAs for that owner.
   * @param options - Filter options (owner, creditManager, health factor, etc.)
   * @param blockNumber - Optional block number for the read
   * @returns Credit accounts (with investor) sorted by health factor ascending
   */
  getCreditAccountsWithInvestor(
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
  ): Promise<Array<CreditAccountDataWithInvestor>>;

  /**
   * Loads credit account data for the given addresses using simulateWithPriceUpdates (with price updates applied before the read).
   * @param accounts - Credit account addresses to load
   * @param priceUpdateTxs - Price feed update txs to simulate before the read (e.g. from generatePriceFeedsUpdateTxs)
   * @param blockNumber - Optional block number for the read
   * @returns Array of CreditAccountData in the same order as accounts
   */
  loadSpecifiedAccounts(
    accounts: Address[],
    priceUpdateTxs: IPriceUpdateTx<{
      priceFeed: `0x${string}`;
      timestamp: number;
    }>[],
    blockNumber?: bigint,
  ): Promise<Array<CreditAccountData>>;
  /**
   * Method to get all claimable rewards for credit account (ex. stkUSDS SKY rewards)
   * Assosiates rewards by adapter + stakedPhantomToken
   * @param {Address} creditAccount - address of credit account to get rewards for
   * @returns {Array<Rewards>} list of {@link Rewards} that can be claimed
   */
  getRewards(creditAccount: Address): Promise<Array<Rewards>>;
  /**
   * Method to get all connected bots for credit account
   * @param {Array<AccountToCheck>} accountsToCheck - list of credit accounts
   * @param {Address | undefined} legacyMigrationBot - address of the bot to check connected bots on
   * and their credit managers to check connected bots on
   * @returns call result of getConnectedBots for each credit account
   */
  getConnectedBots(
    accountsToCheck: Array<AccountToCheck>,
    legacyMigrationBot: Address | undefined,
    additionalBots: Array<Address>,
  ): Promise<{
    legacy: GetConnectedBotsResult;
    legacyMigration: GetConnectedMigrationBotsResult;
    additionalBots: Array<
      Omit<NonNullable<GetConnectedMigrationBotsResult>, "botAddress">
    >;
  }>;
  /**
   * V3.1 method, throws in V3. Connects/disables a bot and updates prices
   * @param props - {@link SetBotProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  setBot: (
    props: SetBotProps,
  ) => Promise<CreditAccountOperationResult | CreditManagerOperationResult>;

  /**
   * Generates transaction to liquidate credit account
   * @param props - {@link FullyLiquidateProps}
   * @returns Transaction data and optional loss policy data
   */
  fullyLiquidate(props: FullyLiquidateProps): Promise<FullyLiquidateResult>;

  /**
   * Closes credit account or closes credit account and keeps it open with zero debt.
   * - Ca is closed in the following order: price update -> close path to swap all tokens into underlying ->
   * -> disable quotas of exiting tokens -> decrease debt -> disable exiting tokens tokens -> withdraw underlying tokenz
   * @param props - {@link CloseCreditAccountProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  closeCreditAccount(
    props: CloseCreditAccountProps,
  ): Promise<CloseCreditAccountResult>;

  /**
   * Updates quota of credit account.
   * CA quota updated in the following order: price update -> update quotas
   * @param props - {@link UpdateQuotasProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  updateQuotas(props: UpdateQuotasProps): Promise<CreditAccountOperationResult>;

  /**
   * Adds a single collateral to credit account and updates quotas
   * Collateral is added in the following order: price update -> add collateral (with permit) -> update quotas
   * @param props - {@link AddCollateralProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  addCollateral(
    props: AddCollateralProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Increases or decreases debt of credit account; debt decrease uses token ON CREDIT ACCOUNT
   * Debt is changed in the following order: price update -> (enables underlying if it was disabled) -> change debt
   * @param props - {@link ChangeDeptProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  changeDebt(props: ChangeDeptProps): Promise<CreditAccountOperationResult>;

  /**
   * Executes swap specified by given calls, update quotas of affected tokens
   * Swap is executed in the following order: price update -> execute swap path -> update quotas
   * @param props - {@link ExecuteSwapProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  executeSwap(props: ExecuteSwapProps): Promise<CreditAccountOperationResult>;

  /**
   * Start delayed withdrawal for given token
     - Withdrawal is executed in the following order: price update -> execute withdraw calls -> update quotas
   * @param props - {@link StartDelayedWithdrawalProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  startDelayedWithdrawal(
    props: StartDelayedWithdrawalProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Preview delayed withdrawal for given token
   * @param props - {@link PreviewDelayedWithdrawalProps}
   * @returns
   */
  previewDelayedWithdrawal(
    props: PreviewDelayedWithdrawalProps,
  ): Promise<PreviewDelayedWithdrawalResult>;
  /**
   * Get claimable and pending withdrawals of an account
   * @param props - {@link GetPendingWithdrawalsProps}
   * @returns
   */
  getPendingWithdrawals(
    props: GetPendingWithdrawalsProps,
  ): Promise<GetPendingWithdrawalsResult>;
  /**
   * Claim tokens with delayed withdrawal
     - Claim is executed in the following order: price update -> execute claim calls -> update quotas
   * @param props - {@link ClaimDelayedProps}
   * @returns
  */
  claimDelayed(props: ClaimDelayedProps): Promise<CreditAccountOperationResult>;

  /**
   * Executes enable/disable tokens specified by given tokens lists and token prices
   * @param props - {@link EnableTokensProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  enableTokens(props: EnableTokensProps): Promise<CreditAccountOperationResult>;

  /**
   * Returns address to which approval should be given on collateral token
   * It's credit manager for classical markets and special wallet for KYC markets
   * @param props - {@link GetApprovalAddressProps}
   * @returns
   */
  getApprovalAddress(props: GetApprovalAddressProps): Promise<Address>;

  /**
   * Executes swap specified by given calls, update quotas of affected tokens
   * - Open credit account is executed in the following order: price update -> increase debt -> add collateral ->
   *   -> update quotas -> (optionally: execute swap path for trading/strategy) ->
   *   -> (optionally: withdraw debt for lending)
   * - Basic open credit account: price update -> increase debt -> add collateral -> update quotas
   * - Lending: price update -> increase debt -> add collateral -> update quotas -> withdraw debt
   * - Strategy/trading: price update -> increase debt -> add collateral -> update quotas -> execute swap path
   * - In strategy is possible situation when collateral is added, but not swapped; the only swapped value in this case will be debt
   * @param props - {@link OpenCAProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  openCA(props: OpenCAProps): Promise<CreditAccountOperationResult>;

  /**
   * Returns borrow rate with 4 digits precision (10000 = 100%)
   * @param ca
   * @returns
   */
  getBorrowRate(ca: CreditAccountData): bigint;

  /**
   * Returns optimal HF for partial liquidation with 4 digits precision (10000 = 100%)
   * @param ca
   */
  getOptimalHFForPartialLiquidation(ca: CreditAccountData): bigint;

  /**
   * Returns raw txs that are needed to update all price feeds so that all credit accounts (possibly from different markets) compute
   *
   * This can be used by batch liquidator
   * @param accounts
   * @returns
   */
  getUpdateForAccounts(
    accounts: Array<RouterCASlice>,
  ): Promise<UpdatePriceFeedsResult>;

  /**
   * Returns account price updates that can be used in credit facade multicall or liquidator calls
   * @param options
   * @returns
   */
  getOnDemandPriceUpdates(
    options: PriceUpdatesOptions,
  ): Promise<OnDemandPriceUpdates<PriceUpdateV310 | PriceUpdateV300>>;

  /**
   * Returns price updates in format that is accepted by various credit facade methods (multicall, close/liquidate, etc...).
   * @param options
   * @returns
   */
  getPriceUpdatesForFacade(
    options: PriceUpdatesOptions,
  ): Promise<Array<MultiCall>>;

  /**
   * Returns multicall entries to redeem (unwrap) KYC ERC-4626 vault shares into underlying for the given credit manager.
   * Used when withdrawing debt from a KYC market: redeems adapter vault shares so the underlying can be withdrawn.
   * Only applies when the credit manager's underlying is KYC-gated and has an ERC-4626 adapter configured.
   * @param amount - Number of vault shares (adapter tokens) to redeem
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined if underlying is not KYC or no adapter is configured
   */
  getKYCUnwrapCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined>;

  /**
   * Returns multicall entries to deposit (wrap) underlying into KYC ERC-4626 vault shares for the given credit manager.
   * Used when adding debt on a KYC market: deposits underlying into the adapter vault so shares are minted on the account.
   * Only applies when the credit manager's underlying is KYC-gated and has an ERC-4626 adapter configured.
   * @param amount - Amount of underlying assets to deposit into the vault (in underlying decimals)
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined if underlying is not KYC or no adapter is configured
   */
  getKYCWrapCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined>;

  /**
   * Withdraws a single collateral from credit account to wallet to and updates quotas;
   * technically can withdraw several tokens at once
   *   - Collateral is withdrawn in the following order: price update -> withdraw token -> update quotas for affected tokens
   * @param props - {@link WithdrawCollateralProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  withdrawCollateral(
    props: WithdrawCollateralProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Fully repays credit account or repays credit account and keeps it open with zero debt
   * - Repays in the following order: price update -> add collateral to cover the debt ->
   *   -> disable quotas for all tokens -> decrease debt -> disable tokens all tokens -> withdraw all tokens
   * - V3.0 claims rewards for tokens which are specified in legacy SDK
   * - V3.1 claims rewards for all tokens IF router is also V3.1
   * @param props - {@link RepayCreditAccountProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  repayCreditAccount(
    props: RepayCreditAccountProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Fully repays liquidatable account
   * - Repay and liquidate is executed in the following order: price update -> add collateral to cover the debt ->
   *   withdraw all tokens from credit account
   * - V3.0 claims rewards for tokens which are specified in legacy SDK
   * - V3.1 claims rewards for all tokens IF router is also V3.1
   * @param props - {@link RepayAndLiquidateCreditAccountProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  repayAndLiquidateCreditAccount(
    props: RepayAndLiquidateCreditAccountProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Executes swap specified by given calls, update quotas of affected tokens
   *  - Claim rewards is executed in the following order: price update -> execute claim calls ->
   *   -> (optionally: disable reward tokens) -> (optionally: update quotas)
   * - V3.0 claims rewards for tokens which are specified in legacy SDK
   * - V3.1 claims rewards for all tokens IF router is also V3.1 and falls back to legacy calls if router is not v3.0
   * @param props - {@link ClaimFarmRewardsProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  claimFarmRewards(
    props: ClaimFarmRewardsProps,
  ): Promise<CreditAccountOperationResult>;

  previewWithdrawLlamathenaProportionally(
    props: PreviewWithdrawLlamathenaProportionallyProps,
  ): Promise<PreviewWithdrawLlamathenaProportionallyResult>;
  withdrawLlamathenaProportionally(
    props: LlamathenaProportionalWithdrawProps,
  ): Promise<CreditAccountOperationResult>;
}

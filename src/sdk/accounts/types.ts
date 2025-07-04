import type { Address, ContractFunctionArgs } from "viem";

import type { iCreditAccountCompressorAbi } from "../../abi/compressors.js";
import type { BotType } from "../../plugins/bots/types.js";
import type { SDKConstruct } from "../base/SDKConstruct.js";
import type { CreditSuite } from "../market/index.js";
import type {
  Asset,
  RouterCASlice,
  RouterCloseResult,
} from "../router/index.js";
import type { MultiCall, RawTx } from "../types/index.js";
import type { AbstractCreditAccountService } from "./AbstractCreditAccountsService.js";

export type GetCreditAccountsArgs = ContractFunctionArgs<
  typeof iCreditAccountCompressorAbi,
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
}

export interface CloseCreditAccountResult extends CreditAccountOperationResult {
  routerCloseResult: RouterCloseResult;
}

export interface CreditAccountOperationResult {
  tx: RawTx;
  calls: Array<MultiCall>;
  creditFacade: CreditSuite["creditFacade"];
}

export type CloseOptions = "close" | "zeroDebt";

export interface CloseCreditAccountProps {
  operation: CloseOptions;
  creditAccount: RouterCASlice;
  assetsToWithdraw: Array<Address>;
  to: Address;
  slippage?: bigint;
  closePath?: RouterCloseResult;
}

export interface RepayCreditAccountProps
  extends RepayAndLiquidateCreditAccountProps {
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
  creditAccount: RouterCASlice;
}

export interface AddCollateralProps extends PrepareUpdateQuotasProps {
  asset: Asset;
  ethAmount: bigint;
  permit: PermitResult | undefined;
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

export interface ExecuteSwapProps extends PrepareUpdateQuotasProps {
  calls: Array<MultiCall>;
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
}

export interface EnableTokensProps {
  disabledTokens: Array<Address>;
  enabledTokens: Array<Address>;
  creditAccount: RouterCASlice;
}

export interface OpenCAProps extends PrepareUpdateQuotasProps {
  ethAmount: bigint;
  collateral: Array<Asset>;
  debt: bigint;
  withdrawDebt?: boolean;
  permits: Record<string, PermitResult>;
  calls: Array<MultiCall>;

  creditManager: Address;

  to: Address;
  referralCode: bigint;
}

export interface ChangeDeptProps {
  creditAccount: RouterCASlice;
  amount: bigint;
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

/**
  It was planned that bots related to each other like
  {
    liquidationProtection: LiquidationBotType[]
    someOtherBaseType: someOtherDetailedType[ ... ]
  }

  BotBaseType = "liquidationProtection" | someOtherBaseType
  BotDetailedType = LiquidationBotType | someOtherDetailedType
 * */
export type BotBaseType = "LIQUIDATION_PROTECTION";
export type LiquidationBotType = Exclude<BotType, "PARTIAL_LIQUIDATION_BOT">;

export interface SetBotProps {
  /**
   * Address of a bot that is being updated
   */
  botAddress: Address;
  /**
   * Bot base type (see comments above)
   */
  botBaseType: BotBaseType;
  /**
   * Either stop or enable bot
   */
  stopBot: boolean;
  /**
   * Minimal credit account data {@link RouterCASlice} on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export type CreditAccountsServiceInstance = ICreditAccountsService &
  AbstractCreditAccountService;

export interface ICreditAccountsService extends SDKConstruct {
  /**
   * V3.1 method, throws in V3. Connects/disables a bot and updates prices
   * @param props - {@link SetBotProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  setBot: (props: SetBotProps) => Promise<CreditAccountOperationResult>;

  /**
   * Withdraws a single collateral from credit account to wallet to and updates quotas; 
      technically can withdraw several tokens at once
      - Collateral is withdrawn in the following order: price update -> withdraw token -> update quotas for affected tokens
   * @param props - {@link WithdrawCollateralProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  withdrawCollateral(
    props: WithdrawCollateralProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Fully repays credit account or repays credit account and keeps it open with zero debt
     - Repays in the following order: price update -> add collateral to cover the debt -> 
      -> disable quotas for all tokens -> decrease debt -> disable tokens all tokens -> withdraw all tokens
    - V3.0 claims rewards for tokens which are specified in legacy SDK
    - V3.1 claims rewards for all tokens IF router is also V3.1
   * @param props - {@link RepayCreditAccountProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  repayCreditAccount(
    props: RepayCreditAccountProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Fully repays liquidatable account
    - Repay and liquidate is executed in the following order: price update -> add collateral to cover the debt -> 
      withdraw all tokens from credit account
    - V3.0 claims rewards for tokens which are specified in legacy SDK
    - V3.1 claims rewards for all tokens IF router is also V3.1
   * @param props - {@link RepayAndLiquidateCreditAccountProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  repayAndLiquidateCreditAccount(
    props: RepayAndLiquidateCreditAccountProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Executes swap specified by given calls, update quotas of affected tokens
     - Claim rewards is executed in the following order: price update -> execute claim calls -> 
      -> (optionally: disable reward tokens) -> (optionally: update quotas)
    - V3.0 claims rewards for tokens which are specified in legacy SDK
    - V3.1 claims rewards for all tokens IF router is also V3.1 and falls back to legacy calls if router is not v3.0
   * @param props - {@link ClaimFarmRewardsProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  claimFarmRewards(
    props: ClaimFarmRewardsProps,
  ): Promise<CreditAccountOperationResult>;
}

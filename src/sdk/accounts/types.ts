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
  operation: CloseOptions;
}

export interface RepayAndLiquidateCreditAccountProps {
  collateralAssets: Array<Asset>;
  assetsToWithdraw: Array<Asset>;
  creditAccount: RouterCASlice;
  to: Address;
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
  tokensToDisable: Array<Asset>;
  calls: Array<MultiCall>;
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
}

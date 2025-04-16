import type { Address, ContractFunctionArgs } from "viem";

import type { iCreditAccountCompressorAbi } from "../../abi/compressors.js";
import type { CreditSuite } from "../market/index.js";
import type {
  Asset,
  RouterCASlice,
  RouterCloseResult,
} from "../router/index.js";
import type { MultiCall, RawTx } from "../types/index.js";

export type GetCreditAccountsArgs = ContractFunctionArgs<
  typeof iCreditAccountCompressorAbi,
  "pure" | "view",
  "getCreditAccounts"
>;

export interface CreditAccountFilter {
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
  minQuota: Array<Asset>;
  averageQuota: Array<Asset>;
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
  assetsToWithdraw: Array<Asset>;
  to: Address;
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

import type { Address } from "viem";
import type { PartialRecord } from "../../sdk/index.js";

export type TokenTypeStrategy =
  | "eth"
  | "s"
  | "btc"
  | "stable"
  | "wbnb"
  | "wxtz"
  | "bfBTC"
  | "mon";

export type StrategyMarketType = "common" | "rwa";

export interface StrategyConfigPayload {
  name: string;
  /**
   * Token symbol of the strategy, is used as key in the strategies list.
   */
  id: string;
  /**
   * Token address of the strategy
   */
  tokenOutAddress: Address;
  /**
   * Chain id and network type as they are written in sdk. Wrong entries are being omitted
   */
  chainId: number;
  network: string;
  /**
   * Credit managers strategy can be opened on. If it doesn't present - strategy won't be shown
   */
  creditManagers: Array<Address>;
  /**
   * Strategy type. Used for filtering
   */
  strategyType: [TokenTypeStrategy];
  /**
   * Strategy market type. Used for filtering
   */
  strategyMarketType?: [StrategyMarketType];
  /**
   * undefined - released;
   * number - one value for the current chain.
   * In ms, for example: 1740398400_000;
   */
  releaseAt?: number;
  /**
   * An option to show strategies in dev environment only.
   * undefined, false = no.
   */
  hideInProd?: boolean;
  /** An option to show strategies in main app (app.gearbox.fi).
   * undefined, true = yes; false = no.
   */
  showInMainApp?: boolean;
  /**
   * undefined - no restrictions.
   * number - one value for the current chain.
   */
  maxLeverage?: number;
  /**
   * undefined, false = no.
   * PartialRecord<number, boolean> - delayed withdrawal for each chain separately.
   */
  delayedWithdrawal?: boolean;
  /**
   * previously known as "bad asset", an asset closing account with may need extra capital.
   * undefined, false = no.
   * VersionRange - problems only in this range.
   */
  issuesOnClose?: boolean | VersionRange;
  /**
   * pools in which current token has zero slippage.
   * pool - boolean.
   */
  zeroSlippage?: PartialRecord<Address, boolean>;
  /**
   * pools in which additional quota should be bought for current token.
   * pool - boolean
   */
  additionalRewardQuotas?: PartialRecord<Address, Address[]>;
  /**
   * If address provided - it is considered that this collateral can be used across all listed cms.
   * If object provided - it is considered that this collateral can be used only on the specified cm.
   */
  additionalCollaterals?: Array<Address | { token: Address; cm: Address }>;
}

type VersionRange = [number, number];

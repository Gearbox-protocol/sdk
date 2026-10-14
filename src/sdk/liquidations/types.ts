import type { Address } from "viem";
import type {
  ChainId,
  DataResponse,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidationPosition,
  TxCall,
} from "../../model/index.js";
import type {
  BuildLiquidationTxProps,
  BuildPartialLiquidationTxProps,
  CheckLiquidationInput,
  CheckLiquidationOptions,
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  GetLiquidationPositionsProps,
  GetPartialLiquidationDetailsProps,
  LiquidationValidationError,
} from "../../onchain/index.js";

/**
 * On-chain discovery of liquidatable credit accounts and delayed-withdrawal
 * positions a liquidator wallet holds.
 **/
export interface ILiquidations {
  /**
   * All liquidatable credit accounts: health factor below 1 plus accounts of
   * expired credit managers with outstanding debt. Optionally narrowed.
   **/
  getLiquidatableAccounts(
    props?: GetLiquidatableAccountsProps<true>,
  ): Promise<DataResponse<LiquidatableAccount[]>>;
  /**
   * Detailed view of one liquidatable credit account, including the assets the
   * liquidator receives. Throws when the chain cannot answer.
   **/
  getLiquidationDetails(
    props: GetLiquidationDetailsProps<true>,
  ): Promise<DataResponse<LiquidationDetails>>;
  /**
   * Partial liquidation of one credit account, in the shape of a full one:
   * what the liquidator pays, receives and must approve. A local estimate from
   * the synced oracle state. Parameters left out are derived from current
   * state. Throws for RWA markets and withdrawal phantom collateral.
   **/
  getPartialLiquidationDetails(
    props: GetPartialLiquidationDetailsProps<true>,
  ): Promise<DataResponse<LiquidationDetails>>;
  /**
   * Transaction that fully liquidates a credit account. The reported block is
   * the one the transaction was built against.
   **/
  buildLiquidationTx(
    props: BuildLiquidationTxProps<true>,
  ): Promise<DataResponse<TxCall>>;
  /**
   * Transaction that partially liquidates a credit account, sending the
   * seized collateral to the liquidator. The reported block is the one the
   * transaction was built against. Throws when the account cannot be
   * partially liquidated.
   **/
  buildPartialLiquidationTx(
    props: BuildPartialLiquidationTxProps<true>,
  ): Promise<DataResponse<TxCall>>;
  /**
   * Delayed-withdrawal positions (redemption receipts) owned by a liquidator
   * wallet, optionally scoped to some of the SDK's chains.
   **/
  getLiquidationPositions(
    props: GetLiquidationPositionsProps<true>,
  ): Promise<DataResponse<LiquidationPosition[]>>;
  /**
   * Whether `liquidator` may send a full or partial liquidation of this
   * account.
   *
   * `details` must come from {@link ILiquidations.getLiquidationDetails}
   * called with the same `liquidator`, or from
   * {@link ILiquidations.getPartialLiquidationDetails}.
   **/
  checkLiquidation(
    props: CheckLiquidationInput,
    options?: CheckLiquidationOptions,
  ): Promise<LiquidationValidationError[]>;
  /**
   * Whether `liquidator` may liquidate while the facade is paused; `false` when unknown.
   **/
  isEmergencyLiquidator(props: IsEmergencyLiquidatorProps): boolean;
}

export interface IsEmergencyLiquidatorProps {
  chainId: ChainId;
  creditManager: Address;
  liquidator: Address;
}

/**
 * `sdk.liquidations` per mode: an on-chain read, absent when the SDK reads no
 * chain.
 **/
export interface ILiquidationsByMode {
  onchain: ILiquidations;
  offchain: undefined;
  both: ILiquidations;
}

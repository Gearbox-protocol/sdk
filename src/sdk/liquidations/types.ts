import type {
  DataResponse,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidationPosition,
  TxCall,
} from "../../model/index.js";
import type {
  BuildLiquidationTxProps,
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  GetLiquidationPositionsProps,
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
   * Transaction that fully liquidates a credit account. The reported block is
   * the one the transaction was built against.
   **/
  buildLiquidationTx(
    props: BuildLiquidationTxProps<true>,
  ): Promise<DataResponse<TxCall>>;
  /**
   * Delayed-withdrawal positions (redemption receipts) owned by a liquidator
   * wallet, optionally scoped to some of the SDK's chains.
   **/
  getLiquidationPositions(
    props: GetLiquidationPositionsProps<true>,
  ): Promise<DataResponse<LiquidationPosition[]>>;
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

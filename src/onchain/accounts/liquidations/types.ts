import type { Address, ContractFunctionReturnType } from "viem";
import type { iLiquidationCompressorV313Abi } from "../../../abi/ILiquidationCompressorV313.js";
import type { LiquidatableAccountFilter } from "../../../model/index.js";
import type { RouterCASlice, RouterCloseResult } from "../../router/index.js";
import type {
  BlockNumberProps,
  MultiCall,
  MultichainChainIdsProps,
  MultichainNetworkProps,
  RawTx,
  WithBlock,
  WithMultichain,
} from "../../types/index.js";

/**
 * Raw `LiquidationData` returned by `LiquidationCompressor.getLiquidationData`.
 **/
export type OnchainLiquidationData = ContractFunctionReturnType<
  typeof iLiquidationCompressorV313Abi,
  "nonpayable",
  "getLiquidationData"
>;

/**
 * Single element of {@link OnchainLiquidationData.expectedOutputs}.
 **/
export type OnchainLiquidationOutput =
  OnchainLiquidationData["expectedOutputs"][number];

/**
 * Single call built by the liquidation compressor.
 **/
export type OnchainLiquidationCall = OnchainLiquidationData["liquidationCall"];

/**
 * A dedicated RWA liquidator contract (Midas / Securitize) discovered by
 * `LiquidationCompressor.getRWALiquidators`. `contractType` is the bytes32
 * contract type of the liquidator itself (e.g. `RWA_LIQUIDATOR::MIDAS`),
 * not of the phantom token it was found through.
 **/
export type RWALiquidatorInfo = ContractFunctionReturnType<
  typeof iLiquidationCompressorV313Abi,
  "view",
  "getRWALiquidators"
>[number];

/**
 * Props for {@link LiquidationsService.getLiquidatableAccounts}: the read
 * model's {@link LiquidatableAccountFilter}, whose
 * {@link ChainScopedFilter.chainIds} also narrow which chains the fan-out
 * queries.
 *
 * {@link BlockNumberProps.blockNumber} is only on the single-chain form: a
 * height is not shared across the networks of the fan-out.
 **/
export type GetLiquidatableAccountsProps<Multichain extends boolean = false> =
  LiquidatableAccountFilter & WithBlock<Multichain>;

/**
 * Chain-independent part of {@link GetLiquidationDetailsProps}.
 **/
export interface GetLiquidationDetailsPropsBase {
  /**
   * Credit account to get liquidation details for.
   **/
  creditAccount: Address;
  /**
   * Liquidator wallet address, used to check KYC eligibility. Amounts and
   * received assets are unaffected. When omitted,
   * {@link LiquidationDetails.isLiquidatorEligible} only tells whether the
   * liquidation is KYC-gated at all (see {@link LiquidationDetails.kycProtocol}).
   **/
  liquidator?: Address;
  /**
   * If true, reserve price feed updates are excluded from the price updates
   * applied before computing amounts.
   **/
  ignoreReservePrices?: boolean;
  /**
   * Block to read at. Defaults to the latest block.
   **/
  blockNumber?: bigint;
}

/**
 * Props for {@link LiquidationsService.getLiquidationDetails}.
 *
 * {@link BlockNumberProps.blockNumber} is kept on the multichain form because
 * the method already targets a single {@link MultichainNetworkProps.network}.
 **/
export type GetLiquidationDetailsProps<Multichain extends boolean = false> =
  GetLiquidationDetailsPropsBase &
    WithMultichain<Multichain, MultichainNetworkProps>;

/**
 * Chain-independent part of {@link BuildLiquidationTxProps}.
 **/
export interface BuildLiquidationTxPropsBase {
  /**
   * Credit account to liquidate.
   **/
  creditAccount: Address;
  /**
   * Liquidator wallet address. Required: it is encoded into the transaction
   * as the receiver of the liquidated collateral.
   **/
  liquidator: Address;
  /**
   * If true, reserve price feed updates are excluded from the price updates
   * applied before building the transaction.
   **/
  ignoreReservePrices?: boolean;
  /**
   * Block to read at. Defaults to the latest block.
   **/
  blockNumber?: bigint;
}

/**
 * Props for {@link LiquidationsService.buildLiquidationTx}.
 *
 * {@link BlockNumberProps.blockNumber} is kept on the multichain form because
 * the method already targets a single {@link MultichainNetworkProps.network}.
 **/
export type BuildLiquidationTxProps<Multichain extends boolean = false> =
  BuildLiquidationTxPropsBase &
    WithMultichain<Multichain, MultichainNetworkProps>;

/**
 * Props for {@link LiquidationsService.fullyLiquidate}.
 **/
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
   * Debt only mode — will try to sell just enough of the most valuable token to cover debt.
   */
  debtOnly?: boolean;
}

/**
 * Result of {@link LiquidationsService.fullyLiquidate}.
 **/
export interface FullyLiquidateResult {
  /**
   * Raw transaction data ready to be signed and submitted.
   **/
  tx: RawTx;
  /**
   * Multicall entries passed to the credit facade, price updates included.
   **/
  calls: Array<MultiCall>;
  /**
   * Router result describing the swap path used to convert account tokens into the underlying.
   **/
  routerCloseResult: RouterCloseResult;
}

/**
 * Chain-independent part of {@link GetPartialLiquidationDetailsProps}.
 *
 * Parameters left out are derived from current state, see
 * {@link PartialLiquidationParams}.
 **/
export interface GetPartialLiquidationDetailsPropsBase
  extends GetLiquidationDetailsPropsBase,
    Partial<PartialLiquidationParams> {}

/**
 * Props for {@link LiquidationsService.getPartialLiquidationDetails}.
 *
 * {@link BlockNumberProps.blockNumber} is kept on the multichain form because
 * the method already targets a single {@link MultichainNetworkProps.network}.
 **/
export type GetPartialLiquidationDetailsProps<
  Multichain extends boolean = false,
> = GetPartialLiquidationDetailsPropsBase &
  WithMultichain<Multichain, MultichainNetworkProps>;

/**
 * Chain-independent part of {@link BuildPartialLiquidationTxProps}.
 *
 * Parameters left out are derived from current state, see
 * {@link PartialLiquidationParams}.
 **/
export interface BuildPartialLiquidationTxPropsBase
  extends BuildLiquidationTxPropsBase,
    Partial<PartialLiquidationParams> {}

/**
 * Props for {@link LiquidationsService.buildPartialLiquidationTx}.
 *
 * {@link BlockNumberProps.blockNumber} is kept on the multichain form because
 * the method already targets a single {@link MultichainNetworkProps.network}.
 **/
export type BuildPartialLiquidationTxProps<Multichain extends boolean = false> =
  BuildPartialLiquidationTxPropsBase &
    WithMultichain<Multichain, MultichainNetworkProps>;

/**
 * Chain-independent part of {@link GetLiquidationPositionsProps}.
 **/
export interface GetLiquidationPositionsPropsBase {
  /**
   * Liquidator wallet that owns the redemption receipts (redeemer contracts
   * received as a result of liquidations).
   **/
  liquidator: Address;
}

/**
 * Props for {@link LiquidationsService.getLiquidationPositions}.
 *
 * {@link BlockNumberProps.blockNumber} is only on the single-chain form: a
 * height is not shared across the networks of the fan-out.
 **/
export type GetLiquidationPositionsProps<Multichain extends boolean = false> =
  GetLiquidationPositionsPropsBase &
    WithBlock<Multichain> &
    WithMultichain<Multichain, MultichainChainIdsProps>;

/**
 * Partial liquidation parameters used by
 * {@link LiquidationsService.getPartialLiquidationDetails} and
 * {@link LiquidationsService.buildPartialLiquidationTx}. A caller can pin
 * down any of them instead of letting them be derived from current state.
 *
 * @remarks
 * The defaults are derived in order - `optimalHF` feeds `repaidAmount`, which
 * feeds `minSeizedAmount` - so overriding one still lets the ones after it
 * follow from the override.
 **/
export interface PartialLiquidationParams {
  /**
   * Collateral token to seize.
   * Defaults to the most valuable enabled non-underlying collateral token
   * (by oracle), excluding withdrawal phantom tokens and phantom tokens that
   * unwrap to the underlying
   */
  tokenOut: Address;
  /**
   * Amount of underlying the liquidator pays; the credit manager transfers it
   * from the wallet.
   *
   * Defaults to the amount that brings the account close to `optimalHF`.
   */
  repaidAmount: bigint;
  /**
   * Minimum amount of `token` to seize from `creditAccount`.
   * If `token` is a phantom token, it's withdrawn first, and its `depositedToken` is then sent to the liquidator.
   * In this case, `minSeizedAmount` is denominated in `depositedToken`.
   * Computed internally by default.
   */
  minSeizedAmount: bigint;
  /**
   * Target health factor for partial liquidation (4 digits precision, 10000 = 100%).
   * Defaults to {@link CreditSuite.optimalHFForPartialLiquidation}.
   */
  optimalHF: bigint;
  /**
   * `false` when the account is neither unhealthy nor expired, when no
   * repayment reaches `optimalHF` without leaving less than the minimum debt
   * on the account, or when the account is already there. Computed for the
   * resolved `tokenOut` even when `repaidAmount` was overridden.
   **/
  isPartiallyLiquidatable: boolean;
}

/**
 * Props for {@link LiquidationsService.loadRWALiquidators}.
 *
 * {@link BlockNumberProps.blockNumber} is only on the single-chain form: a
 * height is not shared across the networks of the fan-out.
 **/
export type LoadRWALiquidatorsProps<Multichain extends boolean = false> =
  WithBlock<Multichain> & WithMultichain<Multichain, MultichainChainIdsProps>;

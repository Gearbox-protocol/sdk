import type { Address, ContractFunctionReturnType } from "viem";
import type { iLiquidationCompressorV313Abi } from "../../../abi/ILiquidationCompressorV313.js";
import type { LiquidatableAccountFilter } from "../../../model/index.js";
import type {
  BlockNumberProps,
  MultichainChainIdsProps,
  MultichainNetworkProps,
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
   * Liquidator wallet address, used by the liquidation compressor to check
   * KYC eligibility. When omitted, the zero address is used: amounts and
   * received assets are unaffected, but {@link LiquidationDetails.isLiquidatorEligible}
   * then only tells whether the liquidation is KYC-gated at all
   * (see {@link LiquidationDetails.kycProtocol}).
   **/
  liquidator?: Address;
  /**
   * If true, reserve price feed updates are excluded from the price updates
   * applied by the compressor before computing amounts.
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
   * applied by the compressor before building the transaction.
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
 * Props for {@link LiquidationsService.loadRWALiquidators}.
 *
 * {@link BlockNumberProps.blockNumber} is only on the single-chain form: a
 * height is not shared across the networks of the fan-out.
 **/
export type LoadRWALiquidatorsProps<Multichain extends boolean = false> =
  WithBlock<Multichain> & WithMultichain<Multichain, MultichainChainIdsProps>;

import type { Address, ContractFunctionReturnType } from "viem";
import type { iLiquidationCompressorV313Abi } from "../../../abi/ILiquidationCompressorV313.js";
import type { LiquidatableAccountFilter } from "../../../model/index.js";
import type {
  MultichainNetworkProps,
  MultichainNetworksProps,
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
 * Chain-independent part of {@link GetLiquidatableAccountsProps}.
 *
 * The filter itself lives in the read model, so the chain and the backend
 * cannot disagree on what a condition selects. Chain scoping is expressed as
 * `networks` by {@link MultichainNetworksProps} rather than as the model's
 * `chainIds`, which is why it is omitted here.
 **/
export type GetLiquidatableAccountsPropsBase = Omit<
  LiquidatableAccountFilter,
  "chainIds"
>;

/**
 * Props for {@link LiquidationsService.getLiquidatableAccounts}.
 **/
export type GetLiquidatableAccountsProps<Multichain extends boolean = false> =
  GetLiquidatableAccountsPropsBase &
    WithMultichain<Multichain, MultichainNetworksProps>;

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
}

/**
 * Props for {@link LiquidationsService.getLiquidationDetails}.
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
}

/**
 * Props for {@link LiquidationsService.buildLiquidationTx}.
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
 **/
export type GetLiquidationPositionsProps<Multichain extends boolean = false> =
  GetLiquidationPositionsPropsBase &
    WithMultichain<Multichain, MultichainNetworksProps>;

/**
 * Props for {@link MultichainLiquidationsService.loadRWALiquidators}. The
 * per-chain {@link LiquidationsService.loadRWALiquidators} takes no props.
 **/
export type LoadRWALiquidatorsProps<Multichain extends boolean = false> =
  WithMultichain<Multichain, MultichainNetworksProps>;

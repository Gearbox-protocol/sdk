import type { Address, ContractFunctionReturnType } from "viem";
import { slice } from "viem";
import type { iLiquidationCompressorV313Abi } from "../../../abi/ILiquidationCompressorV313.js";
import type { Asset, CreditAccountData } from "../../base/index.js";
import type { NetworkType } from "../../chain/index.js";
import { ADDRESS_0X0, PERCENTAGE_FACTOR } from "../../constants/index.js";
import type { MultiCall, RawTx } from "../../types/index.js";
import { hexEq } from "../../utils/index.js";
import type {
  CurrentWithdrawals,
  WithdrawalOutput,
} from "../withdrawal-compressor/index.js";
import type {
  LiquidationApproval,
  LiquidatorWithdrawal,
  ReceivedAsset,
} from "./types.js";

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
 * Token balances at or below this threshold are treated as dust and ignored,
 * consistent with the rest of the SDK (see `filterDust`).
 **/
export const DUST_THRESHOLD = 10n;

/**
 * Headroom (in bps) added on top of the amount the liquidation pulls when
 * building the liquidator's approval, so that the transaction does not revert
 * when prices move between the preview and the execution.
 **/
export const LIQUIDATION_APPROVAL_BUFFER = 50n;

/**
 * Estimated amount (in underlying) the liquidator pays to fully liquidate an
 * account: the part of total value used to repay debt and protocol fees.
 *
 * @param totalValue - Account total value in underlying
 * @param liquidationDiscount - Liquidation discount in bps (`100% - liquidation premium`)
 **/
export function calcRepaymentAmount(
  totalValue: bigint,
  liquidationDiscount: number,
): bigint {
  return (totalValue * BigInt(liquidationDiscount)) / PERCENTAGE_FACTOR;
}

/**
 * Estimated liquidator profit (in underlying): the liquidation premium part
 * of total value.
 *
 * @param totalValue - Account total value in underlying
 * @param liquidationDiscount - Liquidation discount in bps (`100% - liquidation premium`)
 **/
export function calcEstimatedProfit(
  totalValue: bigint,
  liquidationDiscount: number,
): bigint {
  return (
    (totalValue * (PERCENTAGE_FACTOR - BigInt(liquidationDiscount))) /
    PERCENTAGE_FACTOR
  );
}

/**
 * Picks the main asset being liquidated: the most valuable enabled
 * non-underlying collateral token above dust (by oracle value in underlying).
 * Returns `undefined` when the account has no eligible non-underlying
 * collateral above dust.
 *
 * @param ca - Credit account data
 * @param convert - Converts a token balance into its value in underlying;
 * must return `0n` when the price is unavailable
 **/
export function pickMainAsset(
  ca: CreditAccountData,
  convert: (token: Address, balance: bigint) => bigint,
): Address | undefined {
  let bestValue = 0n;
  let bestToken: Address | undefined;
  for (const t of ca.tokens) {
    if (hexEq(t.token, ca.underlying)) {
      continue;
    }
    if ((t.mask & ca.enabledTokensMask) === 0n) {
      continue;
    }
    if (t.balance <= DUST_THRESHOLD) {
      continue;
    }
    const value = convert(t.token, t.balance);
    if (value > bestValue) {
      bestValue = value;
      bestToken = t.token;
    }
  }
  return bestToken;
}

/**
 * Converts the single output of a liquidator's delayed withdrawal into an asset.
 *
 * @param outputs - `outputs` or `expectedOutputs` of a withdrawal
 * @param sourceToken - Source token of the withdrawal, for error reporting
 **/
function toWithdrawalOutputAsset(
  outputs: readonly WithdrawalOutput[],
  sourceToken: Address,
): Asset {
  const [output] = outputs;
  if (outputs.length !== 1 || !output) {
    throw new Error(
      `expected exactly one output for withdrawal of ${sourceToken}, got ${outputs.length}`,
    );
  }
  return { balance: output.amount, token: output.token };
}

/**
 * Converts the claim calls of a liquidator's delayed withdrawal into a
 * transaction.
 *
 * @param claimCalls - `claimCalls` of a claimable withdrawal
 * @param sourceToken - Source token of the withdrawal, for error reporting
 * @returns The claim transaction, or `undefined` when there is no claim call
 **/
function toWithdrawalClaimTx(
  claimCalls: readonly MultiCall[],
  sourceToken: Address,
): RawTx | undefined {
  if (claimCalls.length > 1) {
    throw new Error(
      `expected at most one claim call for withdrawal of ${sourceToken}, got ${claimCalls.length}`,
    );
  }
  const [call] = claimCalls;
  return call ? liquidationCallToRawTx(call) : undefined;
}

/**
 * Flattens delayed withdrawals of a liquidator into rows: claimable
 * withdrawals have no `claimableAt` (claimable now) and carry a `claimTx`,
 * pending ones carry the estimated claim timestamp.
 *
 * @param current - Claimable and pending withdrawals from the withdrawal compressor
 * @param network - Network the withdrawals live on
 **/
export function toLiquidatorWithdrawals(
  current: CurrentWithdrawals,
  network: NetworkType,
  chainId: number,
): LiquidatorWithdrawal[] {
  const rows: LiquidatorWithdrawal[] = [];
  for (const w of current.claimable) {
    rows.push({
      network,
      chainId,

      sourceToken: w.token,
      output: toWithdrawalOutputAsset(w.outputs, w.token),

      claimTx: toWithdrawalClaimTx(w.claimCalls, w.token),
      redeemer: w.redeemer,
    });
  }
  for (const w of current.pending) {
    rows.push({
      network,
      chainId,

      sourceToken: w.token,
      output: toWithdrawalOutputAsset(w.expectedOutputs, w.token),

      claimableAt: w.claimableAt,
      redeemer: w.redeemer,
    });
  }
  return rows;
}

/**
 * Normalizes the liquidation compressor outputs into assets the liquidator
 * receives. Zero `redeemerAddress` and `claimableAt` (used by the contracts
 * for "not applicable") become `undefined`.
 *
 * @param outputs - `expectedOutputs` of the compressor's liquidation data
 **/
export function toReceivedAssets(
  outputs: readonly OnchainLiquidationOutput[],
): ReceivedAsset[] {
  return outputs.map(o => {
    if (!o.delayed) {
      return { isDelayed: false, token: o.token, amount: o.amount };
    }
    return {
      isDelayed: true,
      token: o.token,
      amount: o.amount,
      redeemerAddress: hexEq(o.redeemerAddress, ADDRESS_0X0)
        ? undefined
        : o.redeemerAddress,
      claimableAt: o.claimableAt === 0n ? undefined : o.claimableAt,
    };
  });
}

/**
 * Props for {@link toLiquidationApproval}.
 **/
export interface ToLiquidationApprovalProps {
  /**
   * Target of the compressor's `liquidationCall`.
   **/
  target: Address;
  /**
   * Credit facade of the liquidated account's credit manager.
   **/
  creditFacade: Address;
  /**
   * Credit manager of the liquidated account.
   **/
  creditManager: Address;
  /**
   * Token the liquidation transaction pulls from the liquidator.
   **/
  token: Address;
  /**
   * Amount of `token` the liquidation transaction pulls.
   **/
  amount: bigint;
}

/**
 * Resolves the approval the liquidator must grant for the liquidation call.
 *
 * A call targeting the credit facade is paid by `msg.sender` but transferred by
 * the credit manager, so the latter is the spender. Any other target is a
 * dedicated liquidator contract (Midas / Securitize) that pulls the token to
 * itself and re-approves the credit manager, so it is the spender itself.
 *
 * The approved amount includes {@link LIQUIDATION_APPROVAL_BUFFER} of headroom
 * over the pulled amount to tolerate price movements.
 *
 * @param props - See {@link ToLiquidationApprovalProps}
 * @returns The approval, or `undefined` when the call pulls nothing
 **/
export function toLiquidationApproval(
  props: ToLiquidationApprovalProps,
): LiquidationApproval | undefined {
  const { target, creditFacade, creditManager, token, amount } = props;
  if (amount === 0n) {
    return undefined;
  }
  return {
    spender: hexEq(target, creditFacade) ? creditManager : target,
    token,
    amount:
      (amount * (PERCENTAGE_FACTOR + LIQUIDATION_APPROVAL_BUFFER)) /
      PERCENTAGE_FACTOR,
  };
}

/**
 * Converts the compressor's liquidation call into a raw transaction.
 *
 * The calldata is passed through as-is: depending on the liquidated assets,
 * the target is either the credit facade or a dedicated liquidator contract
 * (with its own function signature), so it cannot be re-encoded from a single
 * known ABI.
 *
 * @param call - `liquidationCall` of the compressor's liquidation data
 * @param description - Optional human-readable description
 **/
export function liquidationCallToRawTx(
  call: OnchainLiquidationCall,
  description?: string,
): RawTx {
  return {
    to: call.target,
    value: "0",
    signature: "",
    callData: call.callData,
    contractMethod: {
      name: slice(call.callData, 0, 4),
      inputs: [],
      payable: false,
    },
    contractInputsValues: {},
    description,
  };
}

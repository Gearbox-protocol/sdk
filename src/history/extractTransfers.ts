import {
  type Address,
  getAddress,
  isAddressEqual,
  type Log,
  parseEventLogs,
} from "viem";
import { iCreditFacadeV310Abi } from "../abi/310/generated.js";
import { ierc20Abi } from "../abi/iERC20.js";
import type { TokenTransfer } from "../plugins/adapters/index.js";
import { AddressMap } from "../sdk/index.js";
import { UnexpectedFacadeEventOrderError } from "./errors.js";
import type { ExecuteResult } from "./internal-types.js";
import type { DirectTransferInfo } from "./types.js";

type RawLog = Log<bigint | number, number, false>;

type FacadeEvent = ReturnType<
  typeof parseEventLogs<typeof iCreditFacadeV310Abi>
>[number];

type ExecuteEvent = ReturnType<
  typeof parseEventLogs<typeof iCreditFacadeV310Abi, true, "Execute">
>[number];

type LiquidateCreditAccountEvent = ReturnType<
  typeof parseEventLogs<
    typeof iCreditFacadeV310Abi,
    true,
    "LiquidateCreditAccount"
  >
>[number];

type WithdrawPhantomTokenEvent = ReturnType<
  typeof parseEventLogs<
    typeof iCreditFacadeV310Abi,
    true,
    "WithdrawPhantomToken"
  >
>[number];

type WithdrawCollateralEvent = ReturnType<
  typeof parseEventLogs<typeof iCreditFacadeV310Abi, true, "WithdrawCollateral">
>[number];

type TransferEvent = ReturnType<
  typeof parseEventLogs<typeof ierc20Abi, true, "Transfer">
>[number];

/**
 * Effective `withdrawCollateral` outcome decoded from the facade's
 * `WithdrawCollateral` event.
 */
export interface WithdrawCollateralEventInfo {
  /**
   * For regular withdrawals: the calldata token.
   * For phantom withdrawals: the deposited (resolved) token.
   */
  token: Address;
  amount: bigint;
  to: Address;
}

/**
 * Log index range of single facade operation.
 * [StartMultiCall, FinishMultiCall] or [AddCollateral - 1, PartiallyLiquidateCreditAccount]
 */
interface OperationRange {
  start: number;
  end: number;
}

/**
 * Extracts per-adapter-call token balance changes and detects direct
 * transfers into and out of the credit account (deposits and withdrawals
 * performed independently of the facade).
 *
 * @param logs - raw viem Log[] from transaction receipt, sorted by logIndex
 * @param facadeAddress - the credit facade address (sole boundary event source)
 * @param creditAccount - the credit account address to track
 */
export interface ExtractTransfersResult {
  executeResults: ExecuteResult[];
  directTransfers: DirectTransferInfo[];
  liquidationRemainingFunds?: bigint;
  /** Maps phantom token address to its deposited (underlying) token address. */
  phantomTokens: AddressMap<Address>;
  /**
   * One entry per facade `WithdrawCollateral` event targeting `creditAccount`,
   * in transaction order. Used to recover the effective amount when the
   * calldata uses the `type(uint256).max` "withdraw all" sentinel.
   */
  withdrawCollateralEvents: WithdrawCollateralEventInfo[];
}

export function extractTransfers(
  logs: RawLog[],
  creditAccount: Address,
  pool: Address,
  creditFacade: Address,
): ExtractTransfersResult {
  const ranges = buildOperationRanges(logs, creditFacade, creditAccount);

  // A liquidation puts all of this account's token movement under protocol
  // control -- notably the seized-collateral payout to the liquidator, which is
  // emitted outside the multicall range. Those transfers belong to the
  // LiquidateCreditAccount operation, not to borrower-initiated deposits or
  // withdrawals, so direct-transfer detection is suppressed for the whole tx
  // (mirroring the deposit/withdrawal extractor, which skips liquidation txs).
  const hasLiquidation = logs.some(l => {
    const e = tryDecodeFacadeEvent(l, creditFacade);
    return (
      !!e &&
      (e.eventName === "LiquidateCreditAccount" ||
        e.eventName === "PartiallyLiquidateCreditAccount") &&
      isAddressEqual(e.args.creditAccount, creditAccount)
    );
  });

  let currentEntries: TokenTransfer[] = [];
  const executeResults: ExecuteResult[] = [];
  const directTransfers: DirectTransferInfo[] = [];
  const phantomTokens = new AddressMap<Address>();
  const withdrawCollateralEvents: WithdrawCollateralEventInfo[] = [];
  let liquidationRemainingFunds: bigint | undefined;

  for (const log of logs) {
    const facadeEvent = tryDecodeFacadeEvent(log, creditFacade);
    if (facadeEvent) {
      if (isExecute(facadeEvent, creditAccount)) {
        executeResults.push({
          transfers: currentEntries,
          targetContract: facadeEvent.args.targetContract,
        });
      } else if (isLiquidation(facadeEvent, creditAccount)) {
        liquidationRemainingFunds = facadeEvent.args.remainingFunds;
      } else if (isWithdrawPhantomToken(facadeEvent, creditAccount)) {
        const phantomExec = executeResults.pop();
        if (!phantomExec) {
          throw new Error(
            `WithdrawPhantomToken without preceding Execute at logIndex ${facadeEvent.logIndex}`,
          );
        }
        const rawDeposit = phantomExec.transfers.find(t =>
          isAddressEqual(t.to, creditAccount),
        );
        if (!rawDeposit) {
          throw new Error(
            `phantom Execute has no transfer to credit account at logIndex ${facadeEvent.logIndex}`,
          );
        }
        phantomTokens.upsert(
          facadeEvent.args.token,
          getAddress(rawDeposit.token),
        );
      } else if (isWithdrawCollateral(facadeEvent, creditAccount)) {
        withdrawCollateralEvents.push({
          token: getAddress(facadeEvent.args.token),
          amount: facadeEvent.args.amount,
          to: getAddress(facadeEvent.args.to),
        });
      }
      currentEntries = [];
      continue;
    }

    const transfer = tryDecodeTransfer(log);
    if (!transfer) {
      continue;
    }

    const { from, to, value } = transfer.args;
    const token = transfer.address;

    // Skip pool ↔ credit account transfers (increaseDebt / decreaseDebt)
    if (
      (isAddressEqual(from, pool) && isAddressEqual(to, creditAccount)) ||
      (isAddressEqual(from, creditAccount) && isAddressEqual(to, pool))
    ) {
      continue;
    }

    if (
      isAddressEqual(from, creditAccount) ||
      isAddressEqual(to, creditAccount)
    ) {
      currentEntries.push({ token, amount: value, from, to });
    }

    // A transfer touching the credit account outside every facade operation
    // range is a "direct" movement performed independently of the protocol.
    // Pool legs (increaseDebt / decreaseDebt) were already skipped above, and
    // liquidation txs are excluded wholesale (see hasLiquidation).
    if (
      !hasLiquidation &&
      !isInRange(log.logIndex, ranges) &&
      (isAddressEqual(from, creditAccount) || isAddressEqual(to, creditAccount))
    ) {
      directTransfers.push({
        token,
        from,
        to,
        amount: value,
      });
    }
  }

  return {
    executeResults,
    directTransfers,
    liquidationRemainingFunds,
    phantomTokens,
    withdrawCollateralEvents,
  };
}

/**
 * Identifies log-index ranges that cover all facade-managed operations for
 * a given credit account.  Any Transfer involving the credit account whose
 * logIndex falls outside every range is a "direct transfer" — tokens moved
 * into or out of the account independently of the protocol.
 *
 * Two kinds of ranges exist:
 *
 *  1. **Multicall** — bounded by `[StartMultiCall … FinishMultiCall]`.
 *     Covers open, close, liquidate, multicall, and botMulticall operations.
 *
 *  2. **Partial liquidation** — bounded by
 *     `[AddCollateral.logIndex − 1 … PartiallyLiquidateCreditAccount]`.
 *     The `−1` captures the ERC-20 Transfer emitted by
 *     `CreditManagerV3.addCollateral`'s `safeTransferFrom`, which fires
 *     one log before the facade's `AddCollateral` event.
 */
function buildOperationRanges(
  logs: RawLog[],
  facadeAddress: Address,
  creditAccount: Address,
): OperationRange[] {
  // Step 1: collect breakpoints
  const breakpoints: FacadeEvent[] = [];
  let inMulticall = false;

  for (const l of logs) {
    const e = tryDecodeFacadeEvent(l, facadeAddress);
    switch (e?.eventName) {
      case "StartMultiCall":
        if (isAddressEqual(e.args.creditAccount, creditAccount)) {
          breakpoints.push(e);
          inMulticall = true;
        }
        break;
      case "FinishMultiCall":
        if (inMulticall) {
          breakpoints.push(e);
          inMulticall = false;
        }
        break;
      case "PartiallyLiquidateCreditAccount":
        if (isAddressEqual(e.args.creditAccount, creditAccount)) {
          breakpoints.push(e);
        }
        break;
      case "AddCollateral":
        // Outside a multicall this marks the beginning of a partial liquidation
        if (
          !inMulticall &&
          isAddressEqual(e.args.creditAccount, creditAccount)
        ) {
          breakpoints.push(e);
        }
        break;
    }
  }

  // Step 2 — pair consecutive start/end anchors into ranges.
  const ranges: OperationRange[] = [];
  let i = 0;
  while (i < breakpoints.length - 1) {
    const a = breakpoints[i];
    const b = breakpoints[i + 1];

    if (a.eventName === "StartMultiCall" && b.eventName === "FinishMultiCall") {
      ranges.push({ start: a.logIndex, end: b.logIndex });
      i += 2;
    } else if (
      a.eventName === "AddCollateral" &&
      b.eventName === "PartiallyLiquidateCreditAccount"
    ) {
      // start is logIndex − 1 to include the Transfer from
      // CM.addCollateral's safeTransferFrom that fires right before
      ranges.push({ start: a.logIndex - 1, end: b.logIndex });
      i += 2;
    } else {
      throw new UnexpectedFacadeEventOrderError(a);
    }
  }

  return ranges;
}

/** Tries to decode a raw log as a CreditFacade event; returns undefined on miss */
function tryDecodeFacadeEvent(
  log: RawLog,
  facadeAddress: Address,
): FacadeEvent | undefined {
  if (!isAddressEqual(log.address, facadeAddress)) return undefined;
  return parseEventLogs({
    abi: iCreditFacadeV310Abi,
    logs: [log as unknown as Log],
  })[0];
}

/** Tries to decode a raw log as an ERC-20 Transfer; returns undefined on miss */
function tryDecodeTransfer(log: RawLog): TransferEvent | undefined {
  return parseEventLogs({
    abi: ierc20Abi,
    logs: [log as unknown as Log],
    eventName: "Transfer",
  })[0];
}

/** True if logIndex falls inside any of the given operation ranges */
function isInRange(logIndex: number, ranges: OperationRange[]): boolean {
  return ranges.some(r => logIndex >= r.start && logIndex <= r.end);
}

/** True if facade event is an Execute targeting our credit account */
function isExecute(e: FacadeEvent, creditAccount: Address): e is ExecuteEvent {
  return (
    e.eventName === "Execute" &&
    isAddressEqual(e.args.creditAccount, creditAccount)
  );
}

function isLiquidation(
  e: FacadeEvent,
  creditAccount: Address,
): e is LiquidateCreditAccountEvent {
  return (
    e.eventName === "LiquidateCreditAccount" &&
    isAddressEqual(e.args.creditAccount, creditAccount)
  );
}

function isWithdrawPhantomToken(
  e: FacadeEvent,
  creditAccount: Address,
): e is WithdrawPhantomTokenEvent {
  return (
    e.eventName === "WithdrawPhantomToken" &&
    isAddressEqual(e.args.creditAccount, creditAccount)
  );
}

function isWithdrawCollateral(
  e: FacadeEvent,
  creditAccount: Address,
): e is WithdrawCollateralEvent {
  return (
    e.eventName === "WithdrawCollateral" &&
    isAddressEqual(e.args.creditAccount, creditAccount)
  );
}

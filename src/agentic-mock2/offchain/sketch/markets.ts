import type { Address, Hash } from "viem";
import type {
  CollateralTokenSDK,
  CreditAccountDataSDK,
  CreditSuiteStateSDK,
  MarketDataSDK,
  PriceFeedTreeNodeSDK,
  TokenMetaDataSDK,
} from "./market-data-expanded";

// ======================
//
// CHAINS — no SDK counterpart
//
// ======================

export interface Chain {
  chainId: number;
  name: string;

  explorerUrl: string;
  firstBlock: number;
  wrappedNativeToken: Address;

  riskCuratorsQty: number;
  marketsQty: number;
}

// ======================
//
// CURATORS — no SDK counterpart
//
// ======================

// export interface TreasuryState {
//   address: Address;
//   type: "TREASURY_SPLITTER" | "TREASURY";
//   balances: Record<Address, number>; // balance of underlying
// }

interface MarketConfigurator {
  chainId: number;
  address: Address;
  name: string;
  activeMarkets: Array<MarketShort>;
}

interface MarketConfiguratorEnriched extends MarketConfigurator {
  admin: Address;
  treasury: TreasuryState;
  governor: GovernorState; // admins list
  timelock: TimelockState;
  // queued market updates
}

interface Curator {
  name: string;
  link: string | null;
  description: string | null;

  marketConfigurators: Array<MarketConfigurator>;

  // activity metrics (?)
  // - number of markets
  // - number of executed transactions
  // - etc.
}

// ======================
//
// PRICE FEEDS — no SDK counterpart
//
// ======================

export interface PriceFeedEnriched extends PriceFeedTreeNodeSDK {
  deployedBy: Address;
  tree: PriceFeedTreeNodeSDK[];

  linkedTokens: Array<Address>; // tokens that this price feed is linked to
  usedInMarkets: Array<Address>; // markets that use this price feed
}

// ======================
//
// MARKETS — extends MarketDataSDK
//
// ======================

export interface MarketEnriched extends MarketDataSDK {
  pool7DAgo: PoolStateSDK;
}

// ======================
//
// CREDIT MANAGERS — extends CreditSuiteStateSDK
//
// ======================

interface BlockRef {
  blockNumber: number;
  timestamp: number;
}

/** Liquidity snapshot at a point in time. */
interface CMLiquidityPoint<N = bigint> {
  borrowed: N;
  repaid: N;
  profit: N;
  loss: N;
  at: BlockRef;
}

interface CMLiquidityPointEnriched<N = bigint> extends CMLiquidityPoint<N> {
  // USD metrics
  borrowedUsd: number;
  repaidUsd: number;
  profitUsd: number;
  lossUsd: number;

  // acounts metrics
  // TODO: maybe we do not need some of metrics below
  activeAccounts: number;
  totalOpenedAccounts: number;
  totalClosedAccounts: number;
  totalRepaidAccounts: number; // ?
  totalLiquidatedAccounts: number;
}

export interface CreditSuiteEnriched extends CreditSuiteStateSDK {
  latestData: CMLiquidityPointEnriched;
  creditAccounts: Array<CreditAccountShort>;
}

// ======================
//
// ACCOUNTS — extends CreditAccountDataSDK
//
// ======================

interface CreditAccountOperation {
  // TODO: credit account operation types and their data
  // eg. borrow, repay, swap etc.

  // type: ?
  // protocol: ?
  // details: ?

  txHash: Hash;
  txLogId: number;
  at: BlockRef;
}

export interface CreditAccountShort {
  chainId: number;
  creditAccount: Address;

  /** Session open event */
  opened: BlockRef & { txLogId: number };
  /** Session close event — null while session is active */
  closed: BlockRef | null;
}

export interface CreditAccountEnriched extends CreditAccountDataSDK {
  leverage: number;
  pnl: bigint;
  pnlUsd: number;

  operations: Array<CreditAccountOperation>;

  // 7 days ago metrics
  debt7DAgo: bigint;
  accruedInterest7DAgo: bigint;
  accruedFees7DAgo: bigint;
  totalDebtUSD7DAgo: bigint;
  totalValueUSD7DAgo: bigint;
  twvUSD7DAgo: bigint;
  totalValue7DAgo: bigint;
  healthFactor7DAgo: bigint;

  /** Session open event */
  opened: BlockRef; // & { txLogId: number };
  /** Session close event — null while session is active */
  closed: BlockRef | null;

  // /** Lifecycle data */
  // openTxHash: Hash;
  // openTxLogId: number;
  // closeTxHash: Hash | null;
  // closeTxLogId: number | null;
}

// ======================
//
// ASSETS — extends TokenMetaDataSDK
//
// ======================

export interface TokenInfoEnriched extends TokenMetaDataSDK {
  priceFeeds: Array<Address>;
}

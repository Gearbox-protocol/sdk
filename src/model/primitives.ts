import type { Address, Hex } from "viem";

/**
 * EVM chain id.
 *
 * @example
 * ```ts
 * const mainnet: ChainId = 1;
 * const arbitrum: ChainId = 42161;
 * ```
 **/
export type ChainId = number;

/**
 * Unix timestamp in seconds (not milliseconds).
 *
 * @example
 * ```ts
 * const t: Timestamp = 1719792000; // 2024-07-01T00:00:00Z
 * ```
 **/
export type Timestamp = number;

/**
 * Basis points: an integer where `10000` means 100%.
 *
 * Every percentage-like value of the read model — utilization, liquidation
 * threshold, fees, premiums, APY and APR — uses this scale, which is also the
 * scale the protocol itself stores (`PERCENTAGE_FACTOR`). Values are not
 * clamped to `0..10000`: an APY can exceed 100%, so `12500` (125%) is valid.
 *
 * @example
 * ```ts
 * const full: Bps = 10000; // 100%
 * const lt: Bps = 8600; // 86% liquidation threshold
 * const apy: Bps = 512; // 5.12% APY
 * const smallest: Bps = 1; // 0.01%
 * ```
 **/
export type Bps = number;

/**
 * Coarse denomination class of a token, used to group and filter opportunities
 * by what they are ultimately priced in.
 *
 * This is not read from the chain: it comes from a hardcoded per-chain table
 * and is maintained only for market underlyings, of which there are few.
 *
 * @example
 * ```ts
 * const usdc: AssetType = "Stable";
 * const wsteth: AssetType = "ETH";
 * ```
 **/
export type AssetType = "Stable" | "ETH" | "BTC";

/**
 * Leverage as a plain multiplier, not a percentage and not in basis points.
 * Floating point number.
 *
 * @example
 * ```ts
 * const leveraged: Leverage = 5.5;
 * const unleveraged: Leverage = 1;
 * ```
 **/
export type Leverage = number;

/**
 * A token amount together with its USD valuation.
 *
 * The group that owns the field names the token (e.g. `totalBorrow` of an
 * opportunity is denominated in its `underlyingToken`), so neither the symbol
 * nor the decimals are repeated here.
 *
 * Both fields always come from the same source: a merged opportunity never has
 * `value` from the chain and `valueUsd` from the backend.
 *
 * @example
 * ```ts
 * // 1500.5 USDC (6 decimals) worth $1500.50
 * const amount: Amount = { value: 1_500_500_000n, valueUsd: 1500.5 };
 * ```
 **/
export interface Amount {
  /**
   * Amount in the base units of the owning group's token, i.e. scaled by
   * `10 ** decimals`.
   *
   * @example `1_500_500_000n` for 1500.5 USDC
   **/
  value: bigint;
  /**
   * Value of {@link value} in US dollars as a plain float, or `null` when no
   * price is available for the token.
   *
   * @example `1500.5`
   **/
  valueUsd: number | null;
}

/**
 * An ERC-20 token as the read model describes it.
 *
 * Tokens are always fully inlined rather than referenced by address, so a row
 * is renderable without a separate token dictionary.
 **/
export interface Token {
  /**
   * Chain the token is deployed on.
   *
   * @example `1`
   **/
  chainId: ChainId;
  /**
   * Checksummed token address.
   **/
  address: Address;
  /**
   * Ticker symbol.
   *
   * @example `"USDC"`
   **/
  symbol: string;
  /**
   * Full token name.
   *
   * @example `"USD Coin"`
   **/
  name: string;
  /**
   * Number of decimals the token uses.
   *
   * @example `6` for USDC, `18` for WETH
   **/
  decimals: number;
  /**
   * Denomination class of the token, or `undefined` when the token is not
   * classified.
   *
   * Only market underlyings are classified, so a collateral token normally
   * leaves this unset. Absence means "unknown", never "neither of the three".
   **/
  assetType?: AssetType;
}

/**
 * An {@link Amount} that names its own token.
 **/
export interface TokenAmount extends Amount {
  /**
   * Token {@link Amount.value} is denominated in.
   **/
  token: Token;
}

/**
 * The minimal transaction the read model hands out: enough to sign and send,
 * with no ABI metadata attached.
 **/
export interface TxCall {
  /**
   * Contract the transaction is sent to.
   **/
  to: Address;
  /**
   * Encoded calldata.
   **/
  callData: Hex;
  /**
   * Wei to send along. Omitted for a plain contract call.
   *
   * @example `1_000_000_000_000_000_000n` for 1 ETH
   **/
  value?: bigint;
}

/**
 * The entity that curates a market: sets risk parameters, picks collateral and
 * operates the market configurator.
 **/
export interface Curator {
  /**
   * Address of the market configurator the curator operates. This is the
   * on-chain identity of a curator, not a personal wallet.
   **/
  address: Address;
  /**
   * Display name.
   *
   * @example `"Chaos Labs"`
   **/
  name: string;
  /**
   * Link to the curator's page, or `null` when unknown. The chain knows no
   * URLs, so this is `null` for anything served from the on-chain source.
   *
   * @mode offchain
   **/
  url: string | null;
}

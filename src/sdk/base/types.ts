import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address, Hex } from "viem";
import type { creditAccountCompressorAbi } from "../../abi/compressors/creditAccountCompressor.js";
import type { gaugeCompressorAbi } from "../../abi/compressors/gaugeCompressor.js";
import type { marketCompressorAbi } from "../../abi/compressors/marketCompressor.js";
import type { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import type { rewardsCompressorAbi } from "../../abi/compressors/rewardsCompressor.js";
import type { NetworkType } from "../chain/index.js";

/**
 * Recursively unwraps array types to their element type.
 **/
export type Unarray<A> = A extends readonly unknown[] ? Unarray<A[number]> : A;

/**
 * On-chain identification parameters shared by all Gearbox contracts.
 **/
export interface BaseParams {
  /**
   * Contract address.
   **/
  addr: Address;
  /**
   * Contract version as a raw `uint256`.
   **/
  version: bigint;
  /**
   * ABI-encoded contract type identifier (bytes32).
   **/
  contractType: Hex;
  /**
   * Opaque ABI-encoded configuration specific to the contract type.
   **/
  serializedParams: Hex;
}

/**
 * Same as {@link BaseParams} but accepts JS-friendly value types, useful when
 * constructing parameters manually rather than reading them from chain.
 */
export interface RelaxedBaseParams {
  /**
   * Contract address.
   **/
  addr: Address;
  /**
   * Contract version as a JS `number` or raw `bigint`.
   **/
  version: number | bigint;
  /**
   * Hex bytes32 or its human-readable parsed string.
   **/
  contractType: string;
  /**
   * Optional ABI-encoded configuration.
   **/
  serializedParams?: Hex;
}

/**
 * Wrapper that pairs any contract state payload with its {@link BaseParams}.
 **/
export interface BaseState {
  baseParams: BaseParams;
}

/**
 * Filter criteria for querying markets.
 **/
export type MarketFilter = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof marketCompressorAbi, "getMarkets">["inputs"]
>[0];

/**
 * Viem-inferred credit account data, kept as the source-of-truth anchor for
 * the hand-written {@link CreditAccountData} interface below.
 * @internal
 **/
type RawCreditAccountData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof creditAccountCompressorAbi,
      "getCreditAccountData"
    >["outputs"]
  >
>;

/**
 * Viem-inferred token info element.
 * @internal
 **/
type RawTokenInfo = RawCreditAccountData["tokens"][number];

/**
 * Info on credit account's assets
 **/
export interface TokenInfo {
  /**
   * Token address.
   **/
  token: Address;
  /**
   * Token mask in the credit manager.
   **/
  mask: bigint;
  /**
   * Account's balance of token.
   **/
  balance: bigint;
  /**
   * Account's quota of token.
   **/
  quota: bigint;
  /**
   * Whether balance call was successful.
   **/
  success: boolean;
}

/**
 * Compile-time assertion: `U` must be assignable to `T`.
 *
 * Used to verify that hand-written interfaces stay structurally compatible
 * with viem/abitype-inferred state types. If the inferred type drifts away
 * from the hand-written one (a field is added, removed, or retyped in the
 * ABI), the assertion line that uses it produces a type error.
 **/
export type AssertAssignable<T, U extends T> = U;

// Compile-time check: TokenInfo stays in sync with the ABI-inferred type.
// If the compressor ABI changes, this line will produce a type error.
type _AssertTokenInfo = AssertAssignable<TokenInfo, RawTokenInfo>;

/**
 * On-chain state of a credit account.
 *
 * @remarks
 * Fields from `totalDebtUSD` through `healthFactor` are not filled when
 * `success` is `false`.
 *
 **/
export interface CreditAccountDataPayload {
  /**
   * Credit account address.
   **/
  creditAccount: Address;
  /**
   * Credit manager account is opened in.
   **/
  creditManager: Address;
  /**
   * Facade connected to account's credit manager.
   **/
  creditFacade: Address;
  /**
   * Credit manager's underlying token.
   **/
  underlying: Address;
  /**
   * Credit account's owner (contract address for RWA accounts, EOA for
   * normal accounts).
   **/
  owner: Address;
  /**
   * Expiration timestamp, in case facade is expirable.
   **/
  expirationDate: number;
  /**
   * Bitmask of tokens enabled on credit account as collateral.
   **/
  enabledTokensMask: bigint;
  /**
   * Credit account's debt principal in underlying.
   **/
  debt: bigint;
  /**
   * Base and quota interest accrued on the credit account.
   **/
  accruedInterest: bigint;
  /**
   * Fees accrued on the credit account.
   **/
  accruedFees: bigint;
  /**
   * Account's total debt in USD.
   **/
  totalDebtUSD: bigint;
  /**
   * Account's total value in USD.
   **/
  totalValueUSD: bigint;
  /**
   * Account's threshold-weighted value in USD.
   **/
  twvUSD: bigint;
  /**
   * Account's total value in underlying.
   **/
  totalValue: bigint;
  /**
   * Account's health factor, i.e. ratio of `twvUSD` to `totalDebtUSD`,
   * with 18 decimals precision.
   **/
  healthFactor: bigint;
  /**
   * Whether collateral calculation was successful.
   **/
  success: boolean;
  /**
   * Info on credit account's enabled tokens and tokens with non-zero balance.
   **/
  tokens: readonly TokenInfo[];
}

// Compile-time check: CreditAccountDataPayload stays in sync with the
// ABI-inferred type.  A type error here means the compressor ABI changed.
type _AssertCreditAccountData = AssertAssignable<
  CreditAccountDataPayload,
  RawCreditAccountData
>;

/**
 * Full on-chain snapshot of a single credit account.
 *
 * @typeParam WithInvestor - When `true`, the result includes an `investor`
 *   field (`Address | undefined`).  Defaults to `false` (no investor field).
 **/
export type CreditAccountData<WithInvestor extends boolean = false> =
  WithInvestor extends true
    ? CreditAccountDataPayload & {
        /**
         * Investor EOA address (the real person behind the account).
         * - RWA accounts: resolved from RWA factory, always defined.
         * - Normal accounts: `undefined` (owner IS the investor).
         **/
        investor: Address | undefined;
      }
    : CreditAccountDataPayload;

/**
 * Reward distribution details for a single reward token.
 **/
export type RewardInfo = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof rewardsCompressorAbi, "getRewards">["outputs"]
  >
>;

/**
 * Full on-chain snapshot of a single Gearbox market (pool + credit managers + oracle).
 **/
export type MarketData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof marketCompressorAbi, "getMarkets">["outputs"]
  >
>;

/**
 * Gauge voting state for a pool.
 **/
export type GaugeData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof gaugeCompressorAbi, "getGaugeInfo">["outputs"]
  >
>;

/**
 * Bot connection data for a credit account.
 **/
export type ConnectedBotData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof peripheryCompressorAbi,
      "getConnectedBots"
    >["outputs"]
  >
>;

/**
 * On-chain state of a single credit suite (credit manager + facade + configurator + adapters).
 **/
export type CreditSuiteState = Unarray<MarketData["creditManagers"]>;
/**
 * On-chain state of a credit manager contract.
 **/
export type CreditManagerState = CreditSuiteState["creditManager"];
/**
 * On-chain state of a credit facade contract.
 **/
export type CreditFacadeState = CreditSuiteState["creditFacade"];
/**
 * On-chain state of a credit configurator contract.
 **/
export type CreditConfiguratorState = CreditSuiteState["creditConfigurator"];
/**
 * Adapter contract data for a credit suite.
 **/
export type AdapterData = Unarray<CreditSuiteState["adapters"]>;

/**
 * On-chain state of a lending pool.
 **/
export type PoolState = MarketData["pool"];
/**
 * On-chain state of a quota keeper.
 **/
export type QuotaKeeperState = MarketData["quotaKeeper"];
/**
 * Quota parameters for a single token in a market.
 **/
export type QuotaState = Unarray<QuotaKeeperState["quotas"]>;
/**
 * On-chain state of a rate keeper.
 **/
export type RateKeeperState = MarketData["rateKeeper"];
/**
 * On-chain state of a price oracle (feed map + feed tree).
 **/
export type PriceOracleData = MarketData["priceOracle"];
/**
 * Single token-to-price-feed mapping entry in the oracle.
 **/
export type PriceFeedMapEntry = Unarray<PriceOracleData["priceFeedMap"]>;
/**
 * Node in the hierarchical price feed tree.
 **/
export type PriceFeedTreeNode = Unarray<PriceOracleData["priceFeedTree"]>;
/**
 * Latest price answer from a price feed.
 **/
export type PriceFeedAnswer = PriceFeedTreeNode["answer"];
/**
 * Debt parameters for a credit manager within a pool.
 **/
export type CreditManagerDebtParams = Unarray<
  PoolState["creditManagerDebtParams"]
>;

/**
 * Whether a contract is permitted to participate in gauge voting.
 **/
export enum VotingContractStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  UNVOTE_ONLY = 2,
}

// TODO: make this into recursive type
/**
 * String-valued record of named function arguments produced by calldata parsing.
 **/
export type ParsedCallArgs = Record<string, string>;

/**
 * Human-readable representation of a decoded contract call (v1 format, string-coerced args).
 **/
export interface ParsedCall {
  /**
   * Chain the call targets.
   **/
  chainId: number;
  /**
   * Address of the called contract.
   **/
  target: Address;
  /**
   * Gearbox contract type identifier (e.g. `"CREDIT_MANAGER"`).
   **/
  contractType: string;
  /**
   * Human-readable label for the target address.
   **/
  label: string;
  /**
   * Decoded function name, or a placeholder for unknown selectors.
   **/
  functionName: string;
  /**
   * Named arguments as string key-value pairs.
   **/
  args: ParsedCallArgs;
}

/**
 * Structured representation of a decoded contract call (v2 format) that
 * preserves original argument types instead of coercing to strings.
 */
export interface ParsedCallV2 {
  /**
   * Chain the call targets.
   **/
  chainId: number;
  /**
   * Address of the called contract.
   **/
  target: Address;
  /**
   * Gearbox contract type identifier.
   **/
  contractType: string;
  /**
   * Human-readable label for the target address.
   **/
  label?: string;
  /**
   * Contract version number.
   **/
  version: number;
  /**
   * Function signature produced by viem's `toFunctionSignature`, e.g.:
   * - `"balanceOf(address)"`
   * - `"multicall(address,(address,bytes)[])"`
   * - `"swap(uint256,uint256,bool)"`
   *
   * For unknown selectors: `"unknown function 0x1a2b3c4d"`
   */
  functionName: string;
  /**
   * Named arguments with their original types (bigint, Address, etc.).
   **/
  rawArgs: Record<string, unknown>;
}

/**
 * Shared interface for all SDK contract wrappers, providing identity fields
 * and calldata decoding/stringifying capabilities.
 */
export interface IBaseContract {
  /**
   * On-chain address of the contract.
   **/
  readonly address: Address;
  /**
   * Human-readable contract type (e.g. `"CREDIT_MANAGER"`), or empty string if unknown.
   **/
  readonly contractType: string;
  /**
   * Contract version number.
   * @default 0
   **/
  readonly version: number;
  /**
   * Display name used for labeling in logs and parsed calls.
   *
   * @remarks Other contracts may register additional labels via
   * {@link ChainContractsRegister.setAddressLabel}, so prefer the register's
   * labeling methods for user-facing output.
   */
  readonly name: string;

  /**
   * Chain ID of the contract.
   **/
  readonly chainId: number;

  /**
   * Network type of the contract.
   **/
  readonly networkType: NetworkType;

  /**
   * @internal
   * `true` when the local state has diverged from on-chain and needs a sync.
   **/
  dirty: boolean;

  /**
   * Returns a human-readable snapshot of the contract's current state.
   * @param raw - When `true`, includes raw/unformatted values.
   */
  stateHuman(raw?: boolean): unknown;

  /**
   * Decodes calldata into a {@link ParsedCall} with string-coerced arguments.
   *
   * @remarks This is a safe method: unknown selectors produce a fallback
   * result instead of throwing. For strict parsing, use {@link mustParseFunctionData}.
   */
  parseFunctionData: (calldata: Hex) => ParsedCall;

  /**
   * Same as {@link parseFunctionData}, but throws {@link ContractParseError}
   * on unknown selectors.
   */
  mustParseFunctionData: (calldata: Hex) => ParsedCall;

  /**
   * Converts calldata to a single human-friendly string (e.g. for logging).
   *
   * @remarks This is a safe method that never throws.
   */
  stringifyFunctionData: (calldata: Hex) => string;

  /**
   * Same as {@link stringifyFunctionData}, but throws on decode failure.
   */
  mustStringifyFunctionData: (calldata: Hex) => string;

  /**
   * Decodes calldata into a {@link ParsedCallV2} preserving original argument types.
   * @param calldata - Raw ABI-encoded calldata.
   * @param strict - When `true`, throws on unknown selectors; otherwise returns a fallback.
   */
  parseFunctionDataV2: (calldata: Hex, strict?: boolean) => ParsedCallV2;
}

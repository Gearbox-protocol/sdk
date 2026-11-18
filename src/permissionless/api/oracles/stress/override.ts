import type { Address, Hex, StateOverride } from "viem";
import type { StressSource } from "./types.js";

/**
 * Making a contract lie for the length of one `eth_call`.
 *
 * No fork and no simulation harness: an `eth_call` carries a state override,
 * so the aggregator's code is replaced for that call alone and everything
 * above it — the composite feeds, their bounds, the oracle's own checks — runs
 * as deployed, on real state, at the current block. What comes back is what
 * the market would have read.
 **/

/** A word, as the 32 bytes `PUSH32` wants, two's complement for negatives. */
function word(value: bigint): string {
  return BigInt.asUintN(256, value).toString(16).padStart(64, "0");
}

/**
 * Runtime code answering every call with the same five words.
 *
 * Deliberately selector-blind. A price feed is read through more than
 * `latestRoundData` — `decimals`, `version`, sometimes `latestAnswer` — and
 * dispatching on each would mean knowing which of them every caller in a tree
 * reaches for. Five words decode as the round data; a caller expecting one
 * word reads the first, which is why `roundId` is set to the 8 decimals every
 * Gearbox feed reports rather than to a round number.
 *
 * `answeredInRound` is the same 8, so the `answeredInRound >= roundId` check
 * the older consumers make passes.
 **/
export function roundDataStub(answer: bigint, updatedAt: bigint): Hex {
  return `0x${[
    `7f${word(8n)}600052`,
    `7f${word(answer)}602052`,
    `7f${word(updatedAt)}604052`,
    `7f${word(updatedAt)}606052`,
    `7f${word(8n)}608052`,
    "60a06000f3",
  ].join("")}`;
}

/**
 * Runtime code answering every call with one word.
 *
 * What an exchange rate getter returns, whichever of them the feed calls:
 * `stEthPerToken`, `convertToAssets`, `get_virtual_price`, `pricePerShare`
 * and `getRate` all answer a single `uint256`, so the stub does not need to
 * know which.
 **/
export function rateStub(rate: bigint): Hex {
  return `0x7f${word(rate)}60005260206000f3`;
}

/**
 * The two unbounded ends, as far as the types involved can carry them.
 *
 * "Infinitely large" has to stop somewhere: a price is an `int256` and the
 * arithmetic above it multiplies, so a genuinely enormous answer overflows
 * inside the composite feed and reverts — which would be scored as the
 * oracle resisting, when all that happened is that the test asked something
 * the type cannot hold. `1e12` times the current answer is past any bound,
 * any sanity check and any collateral ratio, and still multiplies.
 */
export const UNBOUNDED_UP = 1e12;

/** The other end: a thousandth of a trillionth, which is as near zero. */
export const UNBOUNDED_DOWN = 1e-12;

/**
 * A double as an exact integer ratio.
 *
 * Multipliers here span twenty-four orders of magnitude, so the obvious
 * `BigInt(Math.round(m * 1e9))` is not available: at the top of the range the
 * product is past what a double carries exactly and the multiplier quietly
 * stops being the one that was asked for. Going through the decimal expansion
 * keeps all fifteen digits a double has and puts the magnitude in the
 * exponent, where it costs nothing.
 */
function asRatio(multiplier: number): { num: bigint; den: bigint } {
  const [mantissa = "0", exponent = "0"] = multiplier
    .toExponential(14)
    .split("e");
  const digits = BigInt(mantissa.replace(".", ""));
  // `toExponential(14)` puts 14 digits after the point, so the integer above
  // is the mantissa scaled by 1e14.
  const power = Number(exponent) - 14;
  return power >= 0
    ? { num: digits * 10n ** BigInt(power), den: 1n }
    : { num: digits, den: 10n ** BigInt(-power) };
}

/**
 * What a source should answer under a multiplier, given what it answers now.
 *
 * Floored at one rather than at zero: a multiplier small enough to round the
 * baseline away would be testing a feed reporting nothing, which is the revert
 * case and is a different scenario with a different meaning.
 */
export function perturb(baseline: bigint, multiplier: number): bigint {
  const bounded = Number.isFinite(multiplier)
    ? Math.min(Math.max(multiplier, UNBOUNDED_DOWN), UNBOUNDED_UP)
    : multiplier > 0
      ? UNBOUNDED_UP
      : UNBOUNDED_DOWN;

  const { num, den } = asRatio(bounded);
  const out = (baseline * num) / den;
  return out === 0n ? 1n : out;
}

/**
 * The state override that makes every source of a group answer a multiple of
 * what it answers now.
 *
 * One override per contract, so a group whose sources share an aggregator
 * perturbs it once. Sources with nothing behind them and sources that are not
 * answering are both left out, for the reasons on
 * {@link StressSource.perturbable} and {@link StressSource.baseline} — an
 * empty result is a group there is nothing to simulate about.
 **/
export function groupOverride(
  sources: StressSource[],
  multiplier: number,
  updatedAt: bigint,
): StateOverride {
  const overrides: StateOverride = [];

  for (const source of sources) {
    // A feed carrying its own answer has no source to perturb, and one that is
    // not answering cannot be made to answer differently.
    if (!source.perturbable || source.baseline === null) {
      continue;
    }
    const value = perturb(source.baseline, multiplier);
    overrides.push({
      address: source.target,
      code:
        source.kind === "rate"
          ? rateStub(value)
          : roundDataStub(value, updatedAt),
    });
  }

  return overrides;
}

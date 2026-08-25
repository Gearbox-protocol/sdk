import type { Address } from "viem";
import type { OnchainSDK } from "../../../index.js";
import { toTargetDecimals } from "./common.js";

/**
 * Converts an amount from one token to another using oracle prices of the
 * given credit manager's market. When the direct oracle path is missing
 * (e.g. `rwa.asset` has no pool price), bridges via the wrapped underlying
 * (1:1 wrap + decimals rescale) — mirrors legacy `convertAmountWithRwaBridge`.
 */
export const convertAmount =
  (sdk: OnchainSDK, creditManager: Address) =>
  (fromTokenRaw: Address, toTokenRaw: Address, amount: bigint): bigint => {
    const fromToken = fromTokenRaw.toLowerCase() as Address;
    const toToken = toTokenRaw.toLowerCase() as Address;

    if (amount === 0n || fromToken === toToken) {
      return amount;
    }

    const market = sdk.marketRegister.findByCreditManager(creditManager);
    const underlying = market.pool.underlying.toLowerCase() as Address;

    let direct = 0n;
    try {
      direct = market.priceOracle.convert(fromToken, toToken, amount);
    } catch {
      // No direct pool price — try the RWA bridge below.
    }
    if (direct > 0n) {
      return direct;
    }

    const rwa = sdk.tokensMeta.rwaUnderlyings.get(underlying);
    if (!rwa) {
      return 0n;
    }
    const asset = rwa.asset.toLowerCase() as Address;

    // asset ↔ underlying of the same market: plain 1:1 wrap rescale.
    if (fromToken === asset && toToken === underlying) {
      return toTargetDecimals(amount, fromToken, toToken, sdk);
    }
    if (fromToken === underlying && toToken === asset) {
      return toTargetDecimals(amount, fromToken, toToken, sdk);
    }

    if (fromToken === asset) {
      const asUnd = toTargetDecimals(amount, fromToken, underlying, sdk);
      return convertAmount(sdk, creditManager)(underlying, toTokenRaw, asUnd);
    }

    if (toToken === asset) {
      const asUnd = convertAmount(sdk, creditManager)(
        fromToken,
        underlying,
        amount,
      );
      return asUnd === 0n
        ? 0n
        : toTargetDecimals(asUnd, underlying, toToken, sdk);
    }

    return 0n;
  };

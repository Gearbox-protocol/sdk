import type { Address } from "viem";
import type { MarketActions } from "../../core/actions/index.js";

/**
 * Strategy module interface representing a strategy JSON file
 */
export interface StrategyModule {
  name: string;
  actions: unknown[];
  tokensIn: string[];
  tokensOut: string[];
  maxEnabledTokens: number;
}

/**
 * Creates a mapping from tokenIn addresses to all possible tokenOut addresses
 * across all strategies.
 *
 * @param strategyModules - Array of strategy modules to process
 * @returns Record mapping tokenIn addresses to arrays of tokenOut addresses
 */
export function createTokenInToTokensOutMap(
  strategyModules: StrategyModule[],
): Record<Address, Address[]> {
  const map: Record<Address, Address[]> = {};

  for (const strategy of strategyModules) {
    for (const tokenIn of strategy.tokensIn) {
      const tokenInLower = tokenIn.toLowerCase() as Address;
      if (!map[tokenInLower]) {
        map[tokenInLower] = [];
      }
      map[tokenInLower].push(
        ...strategy.tokensOut.map(token => token.toLowerCase() as Address),
      );
    }
  }

  return map;
}

/**
 * Creates a mapping from tokenIn-tokenOut pairs to bundle information.
 * Each entry contains the strategy name, actions, and max enabled tokens.
 *
 * @param strategyModules - Array of strategy modules to process
 * @returns Map with keys of format "tokenIn-tokenOut" and values containing bundle info
 */
export function createTokenInTokenOutToBundleMap(
  strategyModules: StrategyModule[],
): Map<string, [string, MarketActions[], number]> {
  const map: Map<string, [string, MarketActions[], number]> = new Map();

  for (const strategy of strategyModules) {
    for (const tokenIn of strategy.tokensIn) {
      const tokenInLower = tokenIn.toLowerCase() as Address;
      for (const tokenOut of strategy.tokensOut) {
        const tokenOutLower = tokenOut.toLowerCase() as Address;
        map.set(`${tokenInLower}-${tokenOutLower}`, [
          strategy.name,
          strategy.actions as MarketActions[],
          strategy.maxEnabledTokens,
        ]);
      }
    }
  }

  return map;
}

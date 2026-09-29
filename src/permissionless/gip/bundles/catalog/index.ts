import type { Address } from "viem";
import type { MarketActions } from "../../core/actions/index.js";
import { BUNDLE_WARNING, type Bundle } from "../types.js";
import {
  tokenInTokenOutToBundle as mainnetTokenInTokenOutToBundle,
  tokenInToTokensOut as mainnetTokenInToTokensOut,
} from "./mainnet/index.js";
import {
  tokenInTokenOutToBundle as monadTokenInTokenOutToBundle,
  tokenInToTokensOut as monadTokenInToTokensOut,
} from "./monad/index.js";
import {
  tokenInTokenOutToBundle as optimismTokenInTokenOutToBundle,
  tokenInToTokensOut as optimismTokenInToTokensOut,
} from "./optimism/index.js";
import {
  tokenInTokenOutToBundle as plasmaTokenInTokenOutToBundle,
  tokenInToTokensOut as plasmaTokenInToTokensOut,
} from "./plasma/index.js";

export type { Bundle } from "../types.js";

const tokenInTokenOutToBundleByChainId: Record<
  number,
  Map<string, [string, MarketActions[], number]>
> = {
  [1]: mainnetTokenInTokenOutToBundle,
  [9745]: plasmaTokenInTokenOutToBundle,
  [10]: optimismTokenInTokenOutToBundle,
  [143]: monadTokenInTokenOutToBundle,
};

export function listBundles(chainId?: number): Array<{
  chainId: number;
  tokenIn: Address;
  tokenOut: Address;
  name: string;
  enabledTokens: number;
}> {
  return Object.entries(tokenInTokenOutToBundleByChainId)
    .filter(([id]) => chainId === undefined || Number(id) === chainId)
    .flatMap(([id, bundles]) =>
      [...bundles].map(([pair, [name, , enabledTokens]]) => {
        const [tokenIn, tokenOut] = pair.split("-") as [Address, Address];
        return { chainId: Number(id), tokenIn, tokenOut, name, enabledTokens };
      }),
    );
}

const tokenInTokenToTokensOutByChainId: Record<
  number,
  Record<Address, Address[]>
> = {
  [1]: mainnetTokenInToTokensOut,
  [9745]: plasmaTokenInToTokensOut,
  [10]: optimismTokenInToTokensOut,
  [143]: monadTokenInToTokensOut,
};

export type BundleData = {
  name: string;
  enabledTokens: number;
  warning: string | undefined;
};

export function getBundleTokensOutByTokenIn(
  chainId: number,
  tokenIn: Address,
): Address[] {
  return tokenInTokenToTokensOutByChainId[chainId][
    tokenIn.toLowerCase() as Address
  ];
}

export function getBundleData(
  chainId: number,
  tokenIn: Address,
  tokenOut: Address,
): BundleData | null {
  const bundleInfo = tokenInTokenOutToBundleByChainId[chainId].get(
    `${tokenIn.toLowerCase() as Address}-${tokenOut.toLowerCase() as Address}`,
  );

  if (!bundleInfo) {
    return null;
  }

  const [name, , enabledTokens] = bundleInfo;

  return {
    name,
    enabledTokens,
    warning: BUNDLE_WARNING[name],
  };
}

export function getBundle(
  chainId: number,
  tokenIn: Address,
  tokenOut: Address,
): Bundle | null {
  if (
    !tokenInTokenOutToBundleByChainId[chainId].has(
      `${tokenIn.toLowerCase() as Address}-${tokenOut.toLowerCase() as Address}`,
    )
  ) {
    return null;
  }

  const [name, actions, enabledTokens] = tokenInTokenOutToBundleByChainId[
    chainId
  ].get(
    `${tokenIn.toLowerCase() as Address}-${tokenOut.toLowerCase() as Address}`,
  )!;
  return {
    name,
    tokenIn: [tokenIn],
    tokenOut: [tokenOut],
    // @dev callers customize the bundle in place, so hand out a copy instead of
    // the module-level actions shared by every request
    actions: structuredClone(actions),
    enabledTokens,
    warning: BUNDLE_WARNING[name],
  };
}

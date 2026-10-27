import type { Address, Chain, PublicClient, Transport } from "viem";
import type { MarketState } from "../../state/market/types.js";
import { lowerAddress, uniqueAddresses } from "../../utils/addressUtils.js";

export function checkCollateralTokens(
  state: MarketState,
  creditManager: Address,
  tokens: Address[],
  assets: Array<{ address: Address; symbol: string }> = [],
): false | string {
  const collateralTokens = [
    state.underlyingAsset,
    ...Object.keys(
      state.creditManagers[lowerAddress(creditManager)].collateralTokens,
    ),
  ].map(lowerAddress);

  const nonCollateral = uniqueAddresses(tokens)
    .filter(token => !collateralTokens.includes(token))
    .map(
      token =>
        assets.find(asset => asset.address.toLowerCase() === token)?.symbol ??
        token,
    );
  const length = nonCollateral.length;

  if (length > 0)
    return `${
      length > 1
        ? `${nonCollateral.slice(0, -1).join(", ")} and ${
            nonCollateral[length - 1]
          }`
        : nonCollateral[0]
    } ${length > 1 ? "are" : "is"} not collateral${length > 1 ? "s" : ""}`;

  return false;
}

/**
 * Coins of a Curve pool.
 *
 * Pools index `coins()` with either `uint256` or `int128` depending on their
 * generation, so the older signature is tried when the newer one reverts.
 **/
export async function getCurveTargetCoins(args: {
  client: PublicClient<Transport, Chain>;
  target: Address;
  nCoins: number;
}): Promise<Address[]> {
  const { client, target, nCoins } = args;

  const readCoins = (indexType: "uint256" | "int128") =>
    client.multicall({
      allowFailure: false,
      contracts: Array.from({ length: nCoins }).map(
        (_, index) =>
          ({
            address: target,
            abi: [
              {
                inputs: [{ name: "arg0", type: indexType }],
                name: "coins",
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            args: [index],
            functionName: "coins",
          }) as const,
      ),
    }) as Promise<Address[]>;

  try {
    return await readCoins("uint256");
  } catch {
    return await readCoins("int128");
  }
}

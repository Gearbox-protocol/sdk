import type { Address, Chain, PublicClient, Transport } from "viem";
import type { MarketStateChanges } from "../../core/market-tx.js";

export function validateCollateralTokens(args: {
  instance: { assets: Array<{ address: Address; symbol: string }> };
  marketChanges: MarketStateChanges;
  creditManager: Address;
  tokens: Address[];
}): false | string {
  const { instance, marketChanges, creditManager, tokens } = args;

  const collateralTokens: Address[] = [marketChanges.after.underlyingAsset]
    .concat(
      Object.keys(
        marketChanges.after.creditManagers[
          creditManager.toLowerCase() as Address
        ].collateralTokens,
      ) as Address[],
    )
    .map(token => token.toLowerCase() as Address);

  const nonCollateral = [
    ...new Set(tokens.map(t => t.toLowerCase() as Address)),
  ]
    .filter(token => !collateralTokens.includes(token))
    .map(
      token =>
        instance.assets.find(asset => asset.address.toLowerCase() === token)
          ?.symbol ?? token,
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

export async function getCurveTargetCoins(args: {
  client: PublicClient<Transport, Chain>;
  target: Address;
  nCoins: number;
}): Promise<Address[]> {
  const { client, target, nCoins } = args;

  try {
    return await client.multicall({
      allowFailure: false,
      contracts: Array.from({ length: nCoins }).map(
        (_, index) =>
          ({
            address: target,
            abi: [
              {
                inputs: [{ name: "arg0", type: "uint256" }],
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
    });
  } catch {
    return await client.multicall({
      allowFailure: false,
      contracts: Array.from({ length: nCoins }).map(
        (_, index) =>
          ({
            address: target,
            abi: [
              {
                inputs: [{ name: "arg0", type: "int128" }],
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
    });
  }
}

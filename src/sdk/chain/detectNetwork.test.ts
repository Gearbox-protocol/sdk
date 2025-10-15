import type { Address, PublicClient, Transport } from "viem";
import { createPublicClient, fallback, getAddress, http } from "viem";
import { expect, it } from "vitest";
import { ierc20Abi } from "../../abi/iERC20.js";
import { hexEq } from "../utils/hex.js";
import { TypedObjectUtils } from "../utils/mappers.js";
import type { GearboxChain } from "./chains.js";
import { chains } from "./chains.js";

const allTokens = Object.values(chains).map(chain => ({
  address: getAddress(chain.wellKnownToken.address),
  network: chain.network,
  symbol: chain.wellKnownToken.symbol,
}));

// helper functions
async function fetchTokensMulticall(
  client: PublicClient<Transport, GearboxChain>,
): Promise<Record<Address, string | undefined>> {
  const resp = await client.multicall({
    contracts: allTokens.map(
      token =>
        ({
          address: token.address,
          abi: ierc20Abi,
          functionName: "symbol",
        }) as const,
    ),
    allowFailure: true,
  });
  const result: Record<Address, string | undefined> = {};
  for (let i = 0; i < resp.length; i++) {
    const token = allTokens[i];
    const r = resp[i];
    result[token.address] = r.status === "success" ? r.result : undefined;
  }
  return result;
}

async function fetchTokensSimple(
  client: PublicClient<Transport, GearboxChain>,
): Promise<Record<Address, string | undefined>> {
  const resp = await Promise.allSettled(
    allTokens.map(token =>
      client.readContract({
        address: token.address,
        abi: ierc20Abi,
        functionName: "symbol",
      }),
    ),
  );
  const result: Record<Address, string | undefined> = {};
  for (let i = 0; i < resp.length; i++) {
    const token = allTokens[i];
    const r = resp[i];
    result[token.address] = r.status === "fulfilled" ? r.value : undefined;
  }
  return result;
}

async function fetchAllTokens(
  chain: GearboxChain,
): Promise<Record<Address, string | undefined>> {
  const client = createPublicClient({
    chain: chain,
    transport: fallback(
      Object.values(chain.rpcUrls).flatMap(urls => urls.http.map(u => http(u))),
    ),
  });
  if (chain.contracts?.multicall3) {
    return fetchTokensMulticall(client);
  }
  return fetchTokensSimple(client);
}

it("should correctly identify well-known tokens on their respective chains", async () => {
  // Gather all well-known tokens from all chains
  const allChains = Object.values(chains);
  const allTokensOnAllChains = await Promise.all(
    allChains.map(chain => fetchAllTokens(chain)),
  );

  for (let i = 0; i < allChains.length; i++) {
    const {
      network,
      wellKnownToken: { address: wellKnownToken, symbol: wellKnownTokenSymbol },
    } = allChains[i];

    const tokensOnChain = allTokensOnAllChains[i];
    expect
      .soft(
        tokensOnChain[getAddress(wellKnownToken)],
        `should have well-known token ${wellKnownToken} with symbol ${wellKnownTokenSymbol} on ${network}`,
      )
      .toBe(wellKnownTokenSymbol);
    for (const [token, symbol] of TypedObjectUtils.entries(tokensOnChain)) {
      if (hexEq(token, wellKnownToken)) {
        continue;
      }
      expect
        .soft(
          symbol,
          `should not have token at ${token} on ${network}, but got ${symbol}`,
        )
        .toBeUndefined();
    }
  }
}, 60_000);

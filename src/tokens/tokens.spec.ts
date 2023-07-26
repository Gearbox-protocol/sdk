import { ethers } from "ethers";

import { CHAINS, NetworkType, supportedChains } from "../core/chains";
import { IERC20Metadata__factory } from "../types";
import { IERC20MetadataInterface } from "../types/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata";
import safeMulticall, { KeyedCall } from "../utils/multicall";
import { tokenDataByNetwork } from "./token";

const erc20 = IERC20Metadata__factory.createInterface();

interface SymbolResponse {
  address: string;
  symbol?: string;
  error?: Error;
}

const EXCEPTIONS_IN_SYMBOLS: Record<NetworkType, Record<string, string>> = {
  Mainnet: {
    // Our Symbol <-> On-chain Symbol
    [tokenDataByNetwork.Mainnet.STETH]: "stETH",
  },
  Arbitrum: {
    // Our Symbol <-> On-chain Symbol
    [tokenDataByNetwork.Arbitrum.crvUSDTWBTCWETH]: "crv3crypto",
    [tokenDataByNetwork.Arbitrum["50OHM_50WETH"]]: "50WETH_50OHM",
    [tokenDataByNetwork.Arbitrum.aDAI]: "aArbDAI",
    [tokenDataByNetwork.Arbitrum.aUSDC]: "aArbUSDCn",
    [tokenDataByNetwork.Arbitrum.aUSDT]: "aArbUSDT",
    [tokenDataByNetwork.Arbitrum.aWETH]: "aArbWETH",
  },
};

class TokenSuite {
  private readonly provider: ethers.providers.StaticJsonRpcProvider;
  public readonly network: NetworkType;
  public readonly calls: KeyedCall<IERC20MetadataInterface>[];
  public readonly responses: Record<string, SymbolResponse> = {};

  constructor(network: NetworkType) {
    this.network = network;
    const url = process.env[`${network.toUpperCase()}_TESTS_FORK`];
    if (!url) {
      throw new Error(`${network} provder not found in env`);
    }
    this.provider = new ethers.providers.StaticJsonRpcProvider(
      url,
      CHAINS[network],
    );
    // Omit NOT DEPLOYED
    const entries = Object.entries(tokenDataByNetwork[network]).filter(
      ([_, addr]) => addr?.startsWith("0x"),
    );
    this.calls = entries.map(
      ([symbol, address]): KeyedCall<IERC20MetadataInterface> => ({
        address,
        interface: erc20,
        method: "symbol()",
        key: symbol,
      }),
    );
  }

  public async fetchSymbols(): Promise<void> {
    // even safe multicall fails when one of addresses is an EOA and not contract address
    if (this.network === "Arbitrum") {
      for (const call of this.calls) {
        const c = IERC20Metadata__factory.connect(call.address, this.provider);
        try {
          const s = await c.symbol();
          this.responses[call.key] = {
            address: call.address,
            symbol: this.sanitize(s),
          };
        } catch (e: any) {
          this.responses[call.key] = {
            address: call.address,
            error: e,
          };
        }
      }
    } else {
      const resps = await safeMulticall<string>(this.calls, this.provider);
      for (let i = 0; i < resps.length; i++) {
        const call = this.calls[i];
        const resp = resps[i];
        this.responses[call.key] = {
          address: call.address,
          symbol: resp.error ? undefined : this.sanitize(resp.value ?? ""),
          error: resp.error ? new Error("multicall error") : undefined,
        };
      }
    }
  }

  /**
   * Given <symbol, address> token map on our sdk, asserts that symbol found on chain for this address is the same
   * Takes into account some exceptions
   * @param sdkSymbol Symbol of token in SDK
   */
  public assertSymbol(sdkSymbol: string): void {
    const r = this.responses[sdkSymbol];
    if (r.error) {
      throw new Error(
        `failed to verify ${sdkSymbol} on address ${r.address}: ${console.error}`,
      );
    }
    const expectedSymbol =
      EXCEPTIONS_IN_SYMBOLS[this.network][r.address] ?? sdkSymbol;
    if (r.symbol !== expectedSymbol) {
      throw new Error(
        `Expected ${expectedSymbol} but found ${r.symbol} at ${r.address}`,
      );
    }
  }

  private sanitize(symbol: string): string {
    return symbol.replace(/\-f$/, "").replaceAll("-", "_");
  }
}

describe("Tokens", () => {
  const suites = supportedChains.map(n => new TokenSuite(n));

  before(async function (this) {
    this.timeout(60000);
    await Promise.all(suites.map(s => s.fetchSymbols()));
  });

  suites.forEach(suite => {
    suite.calls.forEach(call => {
      // eslint-disable-next-line max-nested-callbacks
      it(`${call.key} on ${suite.network}`, () => {
        suite.assertSymbol(call.key);
      });
    });
  });
});

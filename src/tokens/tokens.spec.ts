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

  public assertSymbol(symbol: string): void {
    const r = this.responses[symbol];
    if (r.error) {
      throw new Error(
        `failed to verify ${symbol} on address ${r.address}: ${console.error}`,
      );
    }
    if (r.symbol !== symbol) {
      throw new Error(
        `Expected ${symbol} but found ${r.symbol} at ${r.address}`,
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

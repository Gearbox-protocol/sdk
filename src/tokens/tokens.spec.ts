/* eslint-disable max-nested-callbacks */
import { ethers } from "ethers";

import { CHAINS, NetworkType, supportedChains } from "../core/chains";
import { IERC20Metadata__factory } from "../types";
import { KeyedCall, safeMulticall } from "../utils/multicall";
import { SupportedToken, tokenDataByNetwork } from "./token";

const erc20 = IERC20Metadata__factory.createInterface();

// Some contracts return something other than string for symbol
const NON_ERC20_SYMBOLS = {
  [tokenDataByNetwork.Mainnet.MKR]: {
    interface: new ethers.utils.Interface([
      "function symbol() view returns (bytes32)",
    ]),
    // convert bytes32 to string
    stringifySymbol: (result: string): string =>
      ethers.utils
        .toUtf8String(ethers.utils.arrayify(result))
        .replaceAll(String.fromCharCode(0), ""), // trim tail of zeroes
  },
};

function identity<T>(value: T): T {
  return value;
}

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
  public readonly calls: KeyedCall<ethers.utils.Interface, SupportedToken>[];
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
    ) as Array<[SupportedToken, string]>;
    this.calls = entries.map(
      ([symbol, address]): KeyedCall<
        ethers.utils.Interface,
        SupportedToken
      > => ({
        address,
        interface: NON_ERC20_SYMBOLS[address]?.interface ?? erc20,
        method: "symbol()",
        key: symbol,
      }),
    );
  }

  public async fetchSymbols(): Promise<void> {
    // even safe multicall fails when one of addresses is an EOA and not contract address
    if (this.network === "Arbitrum") {
      // if (true) {
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
        // most symbols are ok, but some return non-string value for symbol.
        // stringifySymbol makes sure that we get symbol as string
        const stringifySymbol =
          NON_ERC20_SYMBOLS[call.address]?.stringifySymbol ?? identity;
        this.responses[call.key] = {
          address: call.address,
          symbol: resp.error
            ? undefined
            : this.sanitize(stringifySymbol(resp.value ?? "")),
          error: resp.error,
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
        `failed to verify ${sdkSymbol} on address ${r.address}: ${r.error}`,
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

  public assertChecksum(sdkSymbol: SupportedToken): void {
    const sdkAddress = tokenDataByNetwork[this.network][sdkSymbol];
    let err: Error | undefined;
    try {
      const addr = ethers.utils.getAddress(sdkAddress);
      if (addr !== sdkAddress) {
        err = new Error(
          `sdk address for token ${sdkSymbol} is not checksummed: expected ${addr}, got ${sdkAddress}`,
        );
      }
    } catch (e) {
      err = new Error(
        `sdk address ${sdkAddress} for token ${sdkSymbol} has bad checksum: ${e}`,
      );
    }
    if (err) {
      throw err;
    }
  }

  private sanitize(symbol: string): string {
    return symbol.replace(/\-f$/, "").replaceAll("-", "_");
  }
}

describe("Tokens", () => {
  const suites = supportedChains.map(n => new TokenSuite(n));

  before(async function (this) {
    this.timeout(120000);
    await Promise.all(suites.map(s => s.fetchSymbols()));
  });

  suites.forEach(suite => {
    suite.calls.forEach(call => {
      it(`symbol for ${call.key} on ${suite.network}`, () => {
        suite.assertSymbol(call.key);
      });

      it(`address checksum for ${call.key} on ${suite.network}`, () => {
        suite.assertChecksum(call.key);
      });
    });
  });
});

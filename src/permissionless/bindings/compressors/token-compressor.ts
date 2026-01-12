import {
  type Abi,
  type Address,
  type Chain,
  erc20Abi,
  type PublicClient,
  parseAbi,
  type Transport,
} from "viem";
import { tokenCompressorAbi } from "../../../abi/compressors/tokenCompressor.js";
import { BaseContract } from "../../../sdk/index.js";

const abi = tokenCompressorAbi;

export class TokenCompressorContract extends BaseContract<typeof abi> {
  constructor(addr: Address, client: PublicClient<Transport, Chain>) {
    super({ client }, { abi, addr, name: "TokenCompressor" });
  }

  async getTokenInfo(token: Address): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  }> {
    const result = await this.contract.read.getTokenInfo([token]);
    return result as {
      name: string;
      symbol: string;
      decimals: number;
    };
  }

  // @dev workaround for mellow withdrawal phantom token symbol
  async getMellowWithdrawalPhantomTokenInfo(
    tokens: Address[],
  ): Promise<Record<Address, string>> {
    const abi = parseAbi([
      "function multiVault() public view returns (address)",
    ]);

    const contracts = tokens.map(token => ({
      address: token,
      abi: abi,
      functionName: "multiVault" as const,
      args: [] as const,
    }));

    const results = await this.client.multicall({
      contracts: contracts,
      batchSize: 0,
    });

    const multivaultToToken = new Map<Address, Address>();
    const multivaults: Address[] = [];

    for (let i = 0; i < results.length; i++) {
      if (results[i].status === "success") {
        const token = tokens[i];
        const multivault = results[i].result as Address;
        multivaultToToken.set(multivault, token);
        multivaults.push(multivault);
      }
    }

    const resultsSymbols = await this.client.multicall({
      contracts: multivaults.map(multiVault => ({
        address: multiVault,
        abi: erc20Abi,
        functionName: "symbol",
        args: [],
      })),
      allowFailure: true,
      batchSize: 0,
    });

    const tokenToSymbol = new Map<Address, string>();
    for (let i = 0; i < resultsSymbols.length; i++) {
      if (resultsSymbols[i].status === "success") {
        const multivault = multivaults[i];
        const token = multivaultToToken.get(multivault);
        if (token) {
          tokenToSymbol.set(token, resultsSymbols[i].result as string);
        }
      }
    }

    return Object.fromEntries(tokenToSymbol);
  }

  async getTokensInfo(tokens: Address[]): Promise<
    {
      name: string;
      symbol: string;
      decimals: number;
    }[]
  > {
    const mellowPTInfo = await this.getMellowWithdrawalPhantomTokenInfo(tokens);
    const results = await this.client.multicall({
      contracts: tokens.map(token => ({
        address: this.address,
        abi: abi as Abi,
        functionName: "getTokenInfo",
        args: [token],
      })),
      batchSize: 0,
    });

    const tokenInfos = results.map((result, index) => {
      if (result.status === "failure") {
        throw new Error(`Failed to get token info: ${result.error}`);
      }
      const token = tokens[index];
      const multivaultSymbol = mellowPTInfo[token];
      const tokenInfo = result.result as unknown as {
        name: string;
        symbol: string;
        decimals: number;
      };
      const postfix = multivaultSymbol ? `[${multivaultSymbol}]` : "";
      return {
        ...tokenInfo,
        symbol: !postfix ? tokenInfo.symbol : `${tokenInfo.symbol} ${postfix}`,
      };
    });

    return tokenInfos;
  }
}

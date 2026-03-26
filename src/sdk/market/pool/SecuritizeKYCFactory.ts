import type { Address } from "viem";
import { iSecuritizeDegenNFTAbi } from "../../../abi/310/iSecuritizeDegenNFT.js";
import { iSecuritizeKYCFactoryAbi } from "../../../abi/310/iSecuritizeKYCFactory.js";
import type { ConstructOptions } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import { AddressMap } from "../../index.js";
import type { MultiCall, RawTx } from "../../types/index.js";

const abi = iSecuritizeKYCFactoryAbi;
type abi = typeof abi;

export class SecuritizeKYCFactory extends BaseContract<abi> {
  private investorCache: AddressMap<Address> | undefined;
  #degenNFT?: Address;

  constructor(options: ConstructOptions, address: Address) {
    super(options, {
      addr: address,
      name: "SecuritizeKYCFactory",
      abi,
    });
  }

  public async precomputeWalletAddress(
    creditManager: Address,
    investor: Address,
  ): Promise<Address> {
    return this.contract.read.precomputeWalletAddress([
      creditManager,
      investor,
    ]);
  }

  public async getWallet(creditAccount: Address): Promise<Address> {
    return this.contract.read.getWallet([creditAccount]);
  }

  /**
   * Returns the investor address for a credit account.
   * @param creditAccount - Credit account address
   * @param fromCache - If true, use and update an in-memory cache (creditAccount -> investor). On cache miss, loads from contract and stores the result for future calls.
   */
  public async getInvestor(
    creditAccount: Address,
    fromCache?: boolean,
  ): Promise<Address> {
    if (fromCache && this.investorCache?.has(creditAccount)) {
      return this.investorCache.get(creditAccount)!;
    }
    const investor = await this.contract.read.getInvestor([creditAccount]);
    if (fromCache) {
      if (!this.investorCache) {
        this.investorCache = new AddressMap<Address>();
      }
      this.investorCache.upsert(creditAccount, investor);
    }
    return investor;
  }

  public async getDSTokens(): Promise<Address[]> {
    const degenNFT = await this.getDegenNFT();
    const tokens = await this.client.readContract({
      address: degenNFT,
      abi: iSecuritizeDegenNFTAbi,
      functionName: "getDSTokens",
    });
    return [...tokens];
  }

  public multicall(
    creditAccount: Address,
    calls: MultiCall[],
    tokensToRegister: Address[],
  ): RawTx {
    return this.createRawTx({
      functionName: "multicall",
      args: [creditAccount, calls, tokensToRegister],
    });
  }

  public openCreditAccount(
    creditManager: Address,
    calls: MultiCall[],
    tokensToRegister: Address[],
  ): RawTx {
    return this.createRawTx({
      functionName: "openCreditAccount",
      args: [creditManager, calls, tokensToRegister],
    });
  }

  public async getDegenNFT(): Promise<Address> {
    if (!this.#degenNFT) {
      this.#degenNFT = await this.contract.read.getDegenNFT();
    }
    return this.#degenNFT;
  }
}

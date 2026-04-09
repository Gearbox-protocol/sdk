import { type Address, decodeAbiParameters } from "viem";
import { iSecuritizeKYCFactoryAbi } from "../../../abi/kyc/iSecuritizeKYCFactory.js";
import type { ConstructOptions } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { MultiCall, RawTx } from "../../types/index.js";
import { AddressMap } from "../../utils/AddressMap.js";
import type {
  SecuritizeInvestorData,
  SecuritizeKYCFactoryStateHuman,
  SecuritizeRegisterMessage,
} from "./securitize-types.js";
import type {
  DStokenData,
  KYCCompressorInvestorData,
  KYCFactoryData,
} from "./types.js";

const abi = iSecuritizeKYCFactoryAbi;
type abi = typeof abi;

export class SecuritizeKYCFactory extends BaseContract<abi> {
  /**
   * Mapping credit account -> investor address
   */
  #investorCache = new AddressMap<Address>();
  public readonly degenNFT: Address;
  public readonly owner: Address;
  public readonly dsTokens: DStokenData[];

  constructor(options: ConstructOptions, data: KYCFactoryData) {
    super(options, {
      ...data.baseParams,
      name: "SecuritizeKYCFactory",
      abi,
    });
    const decoded = decodeAbiParameters(
      [
        { name: "owner", type: "address" },
        { name: "degenNFT", type: "address" },
        {
          name: "dsTokensData",
          type: "tuple[]",
          components: [
            { name: "token", type: "address" },
            { name: "registrar", type: "address" },
            { name: "operators", type: "address[]" },
          ],
        },
      ],
      data.baseParams.serializedParams,
    );
    this.owner = decoded[0];
    this.degenNFT = decoded[1];
    for (const t of data.tokens) {
      this.tokensMeta.upsert(t.addr, t);
    }
    // TODO: these tokens should be present in tokens meta above
    this.dsTokens = decoded[2].map(t => ({
      address: t.token,
      registrar: t.registrar,
      operators: [...t.operators],
    }));
  }

  public decodeInvestorData(
    data: KYCCompressorInvestorData,
  ): SecuritizeInvestorData {
    const { creditAccounts, extraDetails } = data;

    const [registeredTokens, cachedSignatures, registerVaultMessages] =
      decodeAbiParameters(
        [
          { name: "registeredTokens", type: "address[]" },
          {
            name: "cachedSignatures",
            type: "tuple[]",
            components: [...registerMessageTuple],
          },
          {
            name: "registerVaultMessages",
            type: "tuple[]",
            components: [...registerVaultMessageTuple],
          },
        ],
        extraDetails,
      );
    return {
      factory: this.address,
      cachedSignatures: [...cachedSignatures],
      registerVaultMessages: [...registerVaultMessages],
      registeredTokens: [...registeredTokens],
      creditAccounts: creditAccounts.map(ca => {
        const [registeredTokens] = decodeAbiParameters(
          [{ name: "registeredTokens", type: "address[]" }],
          ca.extraDetails,
        );
        return {
          ...ca,
          registeredTokens: [...registeredTokens],
        };
      }),
    };
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
    if (fromCache && this.#investorCache.has(creditAccount)) {
      return this.#investorCache.mustGet(creditAccount);
    }
    const investor = await this.contract.read.getInvestor([creditAccount]);
    if (fromCache) {
      this.#investorCache.upsert(creditAccount, investor);
    }
    return investor;
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

  public multicall(
    creditAccount: Address,
    calls: MultiCall[],
    tokensToRegister: Address[],
    signaturesToCache: SecuritizeRegisterMessage[],
  ): RawTx {
    return this.createRawTx({
      functionName: "multicall",
      args: [creditAccount, calls, tokensToRegister, signaturesToCache],
    });
  }

  public openCreditAccount(
    creditManager: Address,
    calls: MultiCall[],
    tokensToRegister: Address[],
    signaturesToCache: SecuritizeRegisterMessage[],
  ): RawTx {
    return this.createRawTx({
      functionName: "openCreditAccount",
      args: [creditManager, calls, tokensToRegister, signaturesToCache],
    });
  }

  override stateHuman(_raw?: boolean): SecuritizeKYCFactoryStateHuman {
    return {
      ...super.stateHuman(_raw),
      owner: this.labelAddress(this.owner),
      degenNFT: this.labelAddress(this.degenNFT),
      dsTokens: this.dsTokens.map(t => ({
        ...this.tokensMeta.mustGet(t.address),
        registrar: this.labelAddress(t.registrar),
        operators: t.operators.map(o => this.labelAddress(o)),
      })),
    };
  }
}

const registerMessageTuple = [
  { name: "token", type: "address" },
  {
    name: "signature",
    type: "tuple",
    components: [
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
  },
] as const;

const registerVaultMessageTuple = [
  {
    name: "domain",
    type: "tuple",
    components: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
  },
  { name: "investor", type: "address" },
  { name: "operator", type: "address" },
  { name: "token", type: "address" },
  { name: "nonce", type: "uint256" },
  { name: "deadline", type: "uint256" },
] as const;

import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import { iSecuritizeRWAFactoryAbi } from "../../../../abi/rwa/iSecuritizeRWAFactory.js";
import type { GetOpenAccountRequirementsProps } from "../../../accounts/types.js";
import { BaseContract } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { MultiCall, RawTx } from "../../../types/index.js";
import { AddressMap, AddressSet } from "../../../utils/index.js";
import type {
  IRWAFactory,
  RWACompressorInvestorData,
  RWAFactoryData,
} from "../types.js";
import { RWA_FACTORY_SECURITIZE } from "./constants.js";
import { SecuritizeDegenNFT } from "./SecuritizeDegenNFT.js";
import {
  type DStokenData,
  SECURITIZE_REGISTER_VAULT_TYPES,
  type SecuritizeInvestorData,
  type SecuritizeOpenAccountRequirements,
  type SecuritizeOperationParams,
  type SecuritizeRWAFactoryStateHuman,
} from "./types.js";

const abi = iSecuritizeRWAFactoryAbi;
type abi = typeof abi;

export class SecuritizeRWAFactory
  extends BaseContract<abi>
  implements IRWAFactory<typeof RWA_FACTORY_SECURITIZE>
{
  readonly #sdk: OnchainSDK;
  #investorCache = new AddressMap<Address>();
  public readonly degenNFT: SecuritizeDegenNFT;
  public readonly owner: Address;
  public readonly dsTokens: DStokenData[];
  public readonly contractType = RWA_FACTORY_SECURITIZE;

  constructor(sdk: OnchainSDK, data: RWAFactoryData) {
    super(sdk, {
      ...data.baseParams,
      name: "SecuritizeRWAFactory",
      abi,
    });
    this.#sdk = sdk;
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
    this.degenNFT = new SecuritizeDegenNFT(sdk, decoded[1]);
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

  protected override parseFunctionParamsV2(
    params: DecodeFunctionDataReturnType<abi>,
    strict?: boolean,
  ): Record<string, unknown> {
    switch (params.functionName) {
      case "openCreditAccount": {
        const [creditManager, calls] = params.args;
        return {
          creditManager,
          calls: this.register.parseMultiCallV2([...calls], strict),
        };
      }
      case "multicall": {
        const [creditAccount, calls] = params.args;
        return {
          creditAccount,
          calls: this.register.parseMultiCallV2([...calls], strict),
        };
      }
      default:
        return super.parseFunctionParamsV2(params, strict);
    }
  }

  /**
   * {@inheritDoc IRWAFactory.decodeInvestorData}
   */
  public decodeInvestorData(
    data: RWACompressorInvestorData,
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
      type: RWA_FACTORY_SECURITIZE,
      factory: this.address,
      cachedSignatures: [...cachedSignatures],
      registerVaultMessages: registerVaultMessages.map(m => ({
        types: SECURITIZE_REGISTER_VAULT_TYPES,
        primaryType: "RegisterVault",
        domain: {
          name: m.domain.name,
          version: m.domain.version,
          chainId: m.domain.chainId,
          verifyingContract: m.domain.verifyingContract,
        },
        message: {
          investor: m.investor,
          operator: m.operator,
          token: m.token,
          nonce: m.nonce,
          deadline: m.deadline,
        },
      })),
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
   * {@inheritDoc IRWAFactory.getInvestor}
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

  /**
   * {@inheritDoc IRWAFactory.getApprovalAddress}
   */
  public async getApprovalAddress(
    options:
      | { creditManager: Address; borrower: Address }
      | { creditManager: Address; creditAccount: Address },
  ): Promise<Address> {
    if ("creditAccount" in options) {
      return this.getWallet(options.creditAccount);
    }
    return this.#precomputeWalletAddress(
      options.creditManager,
      options.borrower,
    );
  }

  /**
   * {@inheritDoc IRWAFactory.getWallet}
   */
  public async getWallet(creditAccount: Address): Promise<Address> {
    return this.contract.read.getWallet([creditAccount]);
  }

  /**
   * {@inheritDoc IRWAFactory.multicall}
   */
  public multicall(
    creditAccount: Address,
    calls: MultiCall[],
    options?: SecuritizeOperationParams,
  ): RawTx {
    // In practice, tokensToRegister and signaturesToCache are not used
    // They might be necessary in one of the following cases:
    // 1. credit manager has multiple DS tokens
    // 2. signature deadline expires
    // 3. signature is revoked by the user
    const { tokensToRegister = [], signaturesToCache = [] } = options ?? {};
    return this.createRawTx({
      functionName: "multicall",
      args: [creditAccount, calls, tokensToRegister, signaturesToCache],
    });
  }

  /**
   * {@inheritDoc IRWAFactory.getOpenAccountRequirements}
   */
  public async getOpenAccountRequirements(
    investor: Address,
    props: GetOpenAccountRequirementsProps,
  ): Promise<SecuritizeOpenAccountRequirements | undefined> {
    const [investorData] = await this.#sdk.rwa.getInvestorData(investor, [
      this.address,
    ]);
    // desired tokens, coming from strategy configuration
    const tokensToRegister = new AddressSet([props.tokenOutAddress]);

    const registredTokens = new AddressSet(investorData.registeredTokens);
    const signedTokens = new AddressSet(
      investorData.cachedSignatures.map(s => s.token),
    );
    const unsignedTokens = tokensToRegister.difference(signedTokens);

    const securitizeTokensToRegister =
      tokensToRegister.difference(registredTokens);
    const requiredSignatures = investorData.registerVaultMessages.filter(m =>
      unsignedTokens.has(m.message.token),
    );

    return {
      type: RWA_FACTORY_SECURITIZE,
      securitizeTokensToRegister: Array.from(securitizeTokensToRegister),
      tokensToRegister: Array.from(tokensToRegister),
      requiredSignatures,
    };
  }

  /**
   * {@inheritDoc IRWAFactory.openCreditAccount}
   */
  public openCreditAccount(
    creditManager: Address,
    calls: MultiCall[],
    options?: SecuritizeOperationParams,
  ): RawTx {
    const { tokensToRegister = [], signaturesToCache = [] } = options ?? {};
    return this.createRawTx({
      functionName: "openCreditAccount",
      args: [creditManager, calls, tokensToRegister, signaturesToCache],
    });
  }

  override stateHuman(_raw?: boolean): SecuritizeRWAFactoryStateHuman {
    return {
      ...super.stateHuman(_raw),
      owner: this.labelAddress(this.owner),
      degenNFT: this.labelAddress(this.degenNFT.address),
      dsTokens: this.dsTokens.map(t => ({
        ...this.tokensMeta.mustGet(t.address),
        registrar: this.labelAddress(t.registrar),
        operators: t.operators.map(o => this.labelAddress(o)),
      })),
    };
  }

  /**
   * Precomputes the wallet address that will own a new credit account
   * for the given investor in the given credit manager.
   *
   * @param creditManager - credit manager address
   * @param investor - investor address
   **/
  async #precomputeWalletAddress(
    creditManager: Address,
    investor: Address,
  ): Promise<Address> {
    return this.contract.read.precomputeWalletAddress([
      creditManager,
      investor,
    ]);
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

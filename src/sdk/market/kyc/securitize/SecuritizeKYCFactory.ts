import { type Address, decodeAbiParameters } from "viem";
import { iSecuritizeKYCFactoryAbi } from "../../../../abi/kyc/iSecuritizeKYCFactory.js";
import type { GetOpenAccountRequirementsProps } from "../../../accounts/types.js";
import { BaseContract } from "../../../base/index.js";
import type { GearboxSDK } from "../../../GearboxSDK.js";
import type { MultiCall, RawTx } from "../../../types/index.js";
import { AddressMap, AddressSet } from "../../../utils/index.js";
import type {
  IKYCFactory,
  KYCCompressorInvestorData,
  KYCFactoryData,
} from "../types.js";
import { KYC_FACTORY_SECURITIZE } from "./constants.js";
import type {
  DStokenData,
  SecuritizeInvestorData,
  SecuritizeKYCFactoryStateHuman,
  SecuritizeOpenAccountRequirements,
  SecuritizeOperationParams,
} from "./types.js";

const abi = iSecuritizeKYCFactoryAbi;
type abi = typeof abi;

export class SecuritizeKYCFactory
  extends BaseContract<abi>
  implements IKYCFactory<typeof KYC_FACTORY_SECURITIZE>
{
  readonly #sdk: GearboxSDK;
  #investorCache = new AddressMap<Address>();
  public readonly degenNFT: Address;
  public readonly owner: Address;
  public readonly dsTokens: DStokenData[];
  public readonly contractType = KYC_FACTORY_SECURITIZE;

  constructor(sdk: GearboxSDK, data: KYCFactoryData) {
    super(sdk, {
      ...data.baseParams,
      name: "SecuritizeKYCFactory",
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

  /**
   * {@inheritDoc IKYCFactory.decodeInvestorData}
   */
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
   * {@inheritDoc IKYCFactory.getInvestor}
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
   * {@inheritDoc IKYCFactory.getApprovalAddress}
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
   * {@inheritDoc IKYCFactory.getWallet}
   */
  public async getWallet(creditAccount: Address): Promise<Address> {
    return this.contract.read.getWallet([creditAccount]);
  }

  /**
   * {@inheritDoc IKYCFactory.multicall}
   */
  public multicall(
    creditAccount: Address,
    calls: MultiCall[],
    options: SecuritizeOperationParams,
  ): RawTx {
    const { tokensToRegister, signaturesToCache } = options;
    return this.createRawTx({
      functionName: "multicall",
      args: [creditAccount, calls, tokensToRegister, signaturesToCache],
    });
  }

  /**
   * {@inheritDoc IKYCFactory.getOpenAccountRequirements}
   */
  public async getOpenAccountRequirements(
    investor: Address,
    props: GetOpenAccountRequirementsProps,
  ): Promise<SecuritizeOpenAccountRequirements | undefined> {
    const [investorData] = await this.#sdk.kyc.getInvestorData(investor, [
      this.address,
    ]);
    const desiredTokens = new AddressSet([props.tokenOutAddress]);

    const registredTokens = new AddressSet(investorData.registeredTokens);
    const signedTokens = new AddressSet(
      investorData.cachedSignatures.map(s => s.token),
    );
    const unsignedTokens = desiredTokens.difference(signedTokens);

    const tokensToRegister = desiredTokens.difference(registredTokens);
    const requiredSignatures = investorData.registerVaultMessages.filter(m =>
      unsignedTokens.has(m.token),
    );

    if (tokensToRegister.size === 0 && requiredSignatures.length === 0) {
      return undefined;
    }

    return {
      type: KYC_FACTORY_SECURITIZE,
      tokensToRegister: Array.from(tokensToRegister),
      requiredSignatures: requiredSignatures,
    };
  }

  /**
   * {@inheritDoc IKYCFactory.openCreditAccount}
   */
  public openCreditAccount(
    creditManager: Address,
    calls: MultiCall[],
    options: SecuritizeOperationParams,
  ): RawTx {
    const { tokensToRegister, signaturesToCache } = options;
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

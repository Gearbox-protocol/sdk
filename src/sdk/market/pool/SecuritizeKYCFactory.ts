import type { Address } from "viem";
import { iSecuritizeKYCFactoryAbi } from "../../../abi/310/iSecuritizeKYCFactory.js";
import type { ConstructOptions } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { MultiCall, RawTx } from "../../types/index.js";

const abi = iSecuritizeKYCFactoryAbi;
type abi = typeof abi;

export class SecuritizeKYCFactory extends BaseContract<abi> {
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

  public async getDSTokens(): Promise<Address[]> {
    const tokens = await this.contract.read.getDSTokens();
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
}

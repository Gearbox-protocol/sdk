import { Address, Hex } from "viem";
import { BaseContract } from "../base/BaseContract";
import { MultiCall, RawTx } from "../../core/transactions";
import { CreditFactory } from "../../factories/CreditFactory";
import { creditFacadeV3Abi } from "../../generated";
import { CreditManagerDataStruct } from "../base/types";
import { CreditFacadeState } from "../state/creditState";

type abi = typeof creditFacadeV3Abi;

export class CreditFacadeContractUser extends BaseContract<abi> {
  // Contracts
  state: CreditFacadeState;

  public static async attach(args: {
    cmd: CreditManagerDataStruct;
    factory: CreditFactory;
  }): Promise<CreditFacadeContractUser> {
    const { cmd, factory } = args;
    const contract = new CreditFacadeContractUser({
      address: cmd.creditFacade as Address,
      factory,
    });

    const cfContract = {
      address: cmd.creditFacade as Address,
      abi: creditFacadeV3Abi,
    };

    const result = await factory.v3.publicClient.multicall({
      contracts: [
        { ...cfContract, functionName: "version" },
        { ...cfContract, functionName: "maxQuotaMultiplier" },
        { ...cfContract, functionName: "expirable" },
        { ...cfContract, functionName: "weth" },
        { ...cfContract, functionName: "expirationDate" },
        { ...cfContract, functionName: "maxDebtPerBlockMultiplier" },
        { ...cfContract, functionName: "botList" },
        { ...cfContract, functionName: "lossParams" },
      ],
    });

    contract.state = {
      address: contract.address,
      version: Number(result[0].result),
      contractType: "CREDIT_FACADE",
      maxQuotaMultiplier: Number(result[1].result!),
      expirable: result[2].result!,
      isDegenMode: cmd.isDegenMode,
      degenNFT: cmd.degenNFT as Hex,
      expirationDate: Number(result[4].result!),
      maxDebtPerBlockMultiplier: Number(result[5].result!),
      botList: result[6].result!,
      minDebt: cmd.minDebt,
      maxDebt: cmd.maxDebt,
      currentCumulativeLoss: result[7].result![0],
      maxCumulativeLoss: result[7].result![1],
      forbiddenTokenMask: cmd.forbiddenTokenMask,
      isPaused: cmd.isPaused,
    };

    contract.version = contract.state.version;

    return contract;
  }

  protected constructor(args: { address: Address; factory: CreditFactory }) {
    super({
      ...args,
      chainClient: args.factory.v3,
      name: `CreditFacadeV3(${args.factory.name})`,
      abi: creditFacadeV3Abi,
    });
  }

  // User functions
  public openCreditAccount(
    onBehalfOf: Address,
    calls: Array<MultiCall>,
    referralCode: number,
  ): RawTx {
    return this.createRawTx({
      functionName: "openCreditAccount",
      args: [onBehalfOf, calls, BigInt(referralCode)],
    });
  }

  public closeCreditAccount(
    creditAccount: Address,
    calls: Array<MultiCall>,
  ): RawTx {
    return this.createRawTx({
      functionName: "closeCreditAccount",
      args: [creditAccount, calls],
    });
  }

  public liquidateCreditAccount(
    creditAccount: Address,
    to: Address,
    calls: Array<MultiCall>,
  ): RawTx {
    return this.createRawTx({
      functionName: "liquidateCreditAccount",
      args: [creditAccount, to, calls],
    });
  }

  public setBotPermission(
    creditAccount: Address,
    bot: Address,
    permissions: bigint,
  ): RawTx {
    return this.createRawTx({
      functionName: "setBotPermissions",
      args: [creditAccount, bot, permissions],
    });
  }
}

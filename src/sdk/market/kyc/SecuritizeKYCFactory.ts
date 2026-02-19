import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Hex,
  Log,
} from "viem";
import { iSecuritizeKYCFactoryAbi } from "../../../abi/310/iSecuritizeKYCFactory.js";
import type {
  ConstructOptions,
  CreditFacadeState,
  CreditSuiteState,
  KYCTokenMeta,
} from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import { ADDRESS_0X0 } from "../../constants/index.js";
import type {
  CreditFacadeStateHuman,
  MultiCall,
  RawTx,
} from "../../types/index.js";
import {
  fmtBinaryMask,
  formatBNvalue,
  formatTimestamp,
} from "../../utils/index.js";

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

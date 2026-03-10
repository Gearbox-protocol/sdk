import { accountMigratorAbi } from "../../../abi/AccountMigrator.js";
import type { ConstructOptions, ParsedCallV2 } from "../../../sdk/index.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = accountMigratorAbi;
type abi = typeof abi;

const protocolAbi = accountMigratorAbi;
type protocolAbi = typeof protocolAbi;

export class AccountMigratorAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });
  }

  /** Legacy adapter not present in integrations-v3. */
  protected override classifyLegacyOperation(
    _parsed: ParsedCallV2,
    _transfers: Transfers,
  ): LegacyAdapterOperation {
    throw new Error(
      `classifyLegacyOperation is not supported for legacy adapter: ${this.contractType}`,
    );
  }
}

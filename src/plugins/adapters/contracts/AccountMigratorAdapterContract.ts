import { accountMigratorAbi } from "../../../abi/AccountMigrator.js";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = accountMigratorAbi;
type abi = typeof abi;

export class AccountMigratorAdapterContract extends AbstractAdapterContract<abi> {
  constructor(
    options: ConstructOptions,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(options, { ...args, abi });
  }
}

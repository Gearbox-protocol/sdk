import type { BaseContractStateHuman } from "../sdk/index.js";

export type BytecodeRepositoryStateHuman = BaseContractStateHuman;

export interface PermissionlessStateHuman {
  bytecodeRepository: BytecodeRepositoryStateHuman;
}

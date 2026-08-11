import type { AccountCalculatorOperation } from "../operations/types.js";

interface Props {
  operations: AccountCalculatorOperation[];
}

export function assembleOperationCalls({ operations }: Props) {
  return operations.flatMap(operation => operation.calls);
}

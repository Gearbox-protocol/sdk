import type { AccountCalculatorOperation } from "../operations.js";

interface Props {
  operations: AccountCalculatorOperation[];
}

export function assembleOperationCalls({ operations }: Props) {
  return operations.flatMap(operation => operation.calls);
}

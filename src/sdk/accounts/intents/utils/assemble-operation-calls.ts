import type {
  EncodableCreditAccountOperation,
  OnchainSDK,
} from "../../../index.js";
import type { AccountCalculatorOperation } from "../operations/types.js";
import type { CreditAccountSlice } from "../types.js";

interface Props {
  operations: AccountCalculatorOperation[];
  sdk: OnchainSDK;
  creditAccount: CreditAccountSlice;
}

export async function assembleOperationCalls(props: Props) {
  const operations = await toSdkOperationsFormat({ ...props });

  const calls = props.sdk.accounts.assembleCaOperations({
    operations,
    creditFacade: props.creditAccount.creditFacade,
  });

  return calls;
}

async function toSdkOperationsFormat(
  input: Props,
): Promise<EncodableCreditAccountOperation[]> {
  const { operations } = input;

  const result: EncodableCreditAccountOperation[] = [];

  for (const op of operations) {
    switch (op.type) {
      case "addCollateral":
      case "increaseDebt":
      case "decreaseDebt":
      case "changeQuota":
        result.push(op);
        break;

      case "withdrawCollateral":
        if (op.to === undefined) {
          throw new Error(
            "toSdkOperationsFormat: withdrawCollateral.to is required to assemble",
          );
        }
        result.push({
          type: "withdrawCollateral",
          token: op.token,
          amount: op.amount,
          to: op.to,
        });
        break;

      case "swap": {
        if (!op.calls?.length) {
          throw new Error(
            `toSdkOperationsFormat: missing router calls for swap`,
          );
        }
        result.push({ type: "swap", calls: op.calls });
        break;
      }

      case "wrapRwaCollateral": {
        if (!op.calls?.length) {
          throw new Error(
            "toSdkOperationsFormat: wrapRwaCollateral missing calls",
          );
        }

        result.push({
          type: "wrapRwaCollateral",
          calls: op.calls,
        });
        break;
      }

      case "unwrapRwaCollateral": {
        if (!op.calls?.length) {
          throw new Error(
            "toSdkOperationsFormat: unwrapRwaCollateral missing calls",
          );
        }

        result.push({
          type: "unwrapRwaCollateral",
          calls: op.calls,
        });
        break;
      }

      case "startDelayedWithdrawal": {
        if (!op.calls?.length) {
          throw new Error(
            "toSdkOperationsFormat: startDelayedWithdrawal missing calls",
          );
        }

        // TODO: add dedicated event
        result.push({
          type: "swap",
          calls: op.calls,
        });
        break;
      }

      case "claimDelayedWithdrawal": {
        if (!op.calls.length) {
          throw new Error(
            "toSdkOperationsFormat: claimDelayedWithdrawal missing claimCalls",
          );
        }

        // TODO: add dedicated event
        result.push({
          type: "swap",
          calls: op.calls,
        });
        break;
      }

      case "closeCreditAccount": {
        if (!op.calls.length) {
          throw new Error(
            "toSdkOperationsFormat: closeCreditAccount missing calls",
          );
        }

        // TODO: add dedicated event
        result.push({
          type: "swap",
          calls: op.calls,
        });
        break;
      }

      default: {
        // temporary disable until repay rework
        // const _exhaustive: never = op;
        // throw new Error(`toSdkEncodableOperations: unsupported ${_exhaustive}`);
        throw new Error(
          `toSdkOperationsFormat: unsupported operation ${op.type}`,
        );
      }
    }
  }

  return result;
}

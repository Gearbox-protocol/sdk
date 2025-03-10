import type { SupportedToken } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import {
  iCreditFacadeV2ExtendedAbi,
  iCreditFacadeV3MulticallAbi,
} from "../types";
import type { BigNumberish } from "../utils/formatter";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

interface BalanceDeltaStructOutput {
  amount: bigint;
  token: Address;
}

interface BalanceStructOutput {
  balance: bigint;
  token: Address;
}

export class CreditFacadeParser extends AbstractParser implements IParser {
  version: number;

  constructor(token: SupportedToken, version: number) {
    super(token);
    this.version = version;
    this.abi =
      version >= 300 ? iCreditFacadeV3MulticallAbi : iCreditFacadeV2ExtendedAbi;
    this.adapterName = "CreditFacade";
  }
  parse(calldata: Address): string {
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "addCollateral": {
        const r = functionData.args || [];

        const token = r[0];
        const amount = r[1];

        return `${operationName}(token: ${this.tokenSymbol(
          token,
        )}, amount: ${this.formatBN(amount, this.tokenSymbol(token))})`;
      }
      case "increaseDebt":
      case "decreaseDebt": {
        const [amount] = functionData.args || [];
        return `${operationName}(amount: ${this.formatAmount(amount)})`;
      }
      case "enableToken":
      case "disableToken": {
        const [address] = functionData.args || [];
        return `${operationName}(token: ${this.tokenSymbol(address)})`;
      }

      case "updateQuota": {
        const [address, quotaUpdate, minQuota] = functionData.args || [];
        return `${operationName}(token: ${this.tokenSymbol(
          address,
        )}, quotaUpdate: ${this.formatAmount(
          quotaUpdate,
        )}, minQuota: ${this.formatAmount(minQuota)})`;
      }

      case "revertIfReceivedLessThan": {
        const [balances] = functionData.args || [];

        const balancesStr = (
          balances as Array<BalanceDeltaStructOutput | BalanceStructOutput>
        )
          .map(b => {
            const balance = "balance" in b ? b.balance : b.amount;
            const symbol = this.tokenSymbol(b.token);

            return `${symbol}: ${this.formatBN(balance, symbol)}`;
          })
          .join(", ");

        return `${operationName}(${balancesStr})`;
      }

      case "withdrawCollateral": {
        const [token, amount, to] = functionData.args || [];

        return `${operationName}(token: ${this.tokenSymbol(
          token,
        )}, withdraw: ${this.formatBN(
          amount,
          this.tokenSymbol(token),
        )}, to: ${to})`;
      }

      case "addCollateralWithPermit": {
        const [tokenAddress, amount, deadline, v, r, s] =
          functionData.args || [];

        return `${operationName}(token: ${this.tokenSymbol(
          tokenAddress,
        )}, amount: ${this.formatBN(
          amount,
          this.tokenSymbol(tokenAddress),
        )}, ${[deadline, v, r, s].join(", ")})`;
      }

      case "compareBalances": {
        return `${operationName}()`;
      }

      case "setFullCheckParams": {
        const [collateralHints, minHealthFactor] = functionData.args || [];

        return `${operationName}(token: ${collateralHints
          .map((a: BigNumberish) => this.formatAmount(a))
          .join(", ")}, minHealthFactor: ${minHealthFactor})`;
      }

      case "storeExpectedBalances": {
        const [balanceDeltas] = functionData.args || [];

        return `${operationName}(balanceDeltas: ${balanceDeltas
          .map(
            (b: BalanceDeltaStructOutput) =>
              `${this.tokenSymbol(b.token)}: ${this.formatBN(
                b.amount,
                this.tokenSymbol(b.token),
              )}`,
          )
          .join(", ")})`;
      }

      case "onDemandPriceUpdate": {
        const [token, reserve, data] = functionData.args || [];

        return `${operationName}(token: ${this.tokenOrTickerSymbol(
          token,
        )}, reserve: ${reserve}, data: ${data})`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          operationName,
          calldata,
        );
    }
  }

  formatAmount(amount: BigNumberish): string {
    return this.formatBN(amount, this.contract as SupportedToken);
  }
}

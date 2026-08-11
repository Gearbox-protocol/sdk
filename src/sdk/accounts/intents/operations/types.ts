import type { Address } from "viem";
import type { Asset, MultiCall } from "../../../index.js";
import type { ClaimDelayedWithdrawalOperation } from "./claim-delayed/index.js";
import type { CloseCreditAccountOperation } from "./close-credit-account/index.js";
import type { DecreaseDebtOperation } from "./decrease-debt/index.js";
import type { QuotaUpdateOperation } from "./quota-update/index.js";
import type { SwapOperation } from "./swap/index.js";
import type { UnwrapRwaCollateralOperation } from "./unwrap-rwa-collateral/index.js";
import type { WithdrawCollateralOperation } from "./withdraw-collateral/index.js";
import type { WrapRwaCollateralOperation } from "./wrap-rwa-collateral/index.js";

export type AccountCalculatorOperation =
  | {
      type: "addCollateral";
      token: Address;
      amount: bigint;
      /**
       * Native `msg.value` when the wallet deposit was native ETH and the op
       * was normalized to wrapped native (underlying). Client-only; stripped
       * before SDK assemble.
       */
      value?: bigint;
    }
  | { type: "increaseDebt"; amount: bigint }
  | DecreaseDebtOperation
  | SwapOperation
  | WithdrawCollateralOperation
  | QuotaUpdateOperation
  | CloseCreditAccountOperation
  | {
      type: "repayCreditAccount";
      /** Wallet collateral required for repay (add collateral). */
      expectedRepayAsset?: Asset[];
      /** Tokens withdrawn to wallet after repay. */
      expectedWithdrawAssets?: Asset[];
      /**
       * Native `msg.value` when wallet funds wrapped-native underlying with ETH
       * (same pattern as `addCollateral.value`).
       */
      value?: bigint;
    }
  | WrapRwaCollateralOperation
  | UnwrapRwaCollateralOperation
  | {
      type: "startDelayedWithdrawal";
      token: Address;
      amountIn: bigint;
      outputs: Array<{ token: Address; amount: bigint; isDelayed: boolean }>;
      /**
       * `instant` — compressor settles within instant liquidity (fixed-rate).
       * `delayed` — real delayed withdrawal (wait for maturity / claim).
       */
      settlement: "instant" | "delayed";
      calls?: MultiCall[];
    }
  | ClaimDelayedWithdrawalOperation;

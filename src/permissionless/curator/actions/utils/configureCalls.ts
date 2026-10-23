/**
 * Payload call builders shared by the action definitions.
 *
 * Almost every action is "ask the MarketConfigurator to forward one call to a
 * contract of the market". These helpers encode the forwarded call and the
 * configurator call around it, so a definition's `encode` only states *which*
 * call it makes.
 **/

import type {
  Abi,
  Address,
  ContractFunctionName,
  EncodeFunctionDataParameters,
} from "viem";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { iPoolConfigureActionsAbi } from "../../../../abi/310/configure/iPoolConfigureActions.js";
import { iPriceOracleConfigureActionsAbi } from "../../../../abi/310/configure/iPriceOracleConfigureActions.js";
import type { RawTx } from "../../../../onchain/index.js";
import { createCallData } from "../../../core/raw-tx.js";
import type { MarketState } from "../../state/market/types.js";
import type { GipBuilderContext } from "../builderContext.js";

/** A call to a function of `abi`: its name and arguments. **/
export type ContractCall<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi> | undefined = undefined,
> = Omit<EncodeFunctionDataParameters<abi, functionName>, "abi">;

/** `configurePool(pool, <IPoolConfigureActions call>)`. **/
export function configurePool<
  functionName extends ContractFunctionName<typeof iPoolConfigureActionsAbi>,
>(
  ctx: GipBuilderContext,
  state: MarketState,
  call: ContractCall<typeof iPoolConfigureActionsAbi, functionName>,
): RawTx {
  return ctx.marketConfigurator.configurePool(
    state.address,
    createCallData(iPoolConfigureActionsAbi, call as never),
  );
}

/** `configurePriceOracle(pool, <IPriceOracleConfigureActions call>)`. **/
export function configurePriceOracle<
  functionName extends ContractFunctionName<
    typeof iPriceOracleConfigureActionsAbi
  >,
>(
  ctx: GipBuilderContext,
  state: MarketState,
  call: ContractCall<typeof iPriceOracleConfigureActionsAbi, functionName>,
): RawTx {
  return ctx.marketConfigurator.configurePriceOracle(
    state.address,
    createCallData(iPriceOracleConfigureActionsAbi, call as never),
  );
}

/** `configureCreditSuite(creditManager, <ICreditConfigureActions call>)`. **/
export function configureCreditManager<
  functionName extends ContractFunctionName<typeof iCreditConfigureActionsAbi>,
>(
  ctx: GipBuilderContext,
  creditManager: Address,
  call: ContractCall<typeof iCreditConfigureActionsAbi, functionName>,
): RawTx {
  return ctx.marketConfigurator.configureCreditManager(
    creditManager,
    createCallData(iCreditConfigureActionsAbi, call as never),
  );
}

/** `configureRateKeeper(pool, <rate keeper call>)`. **/
export function configureRateKeeper<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi> | undefined = undefined,
>(
  ctx: GipBuilderContext,
  state: MarketState,
  abi: abi,
  call: ContractCall<abi, functionName>,
): RawTx {
  return ctx.marketConfigurator.configureRateKeeper(
    state.address,
    createCallData(abi, call as never),
  );
}

/** `configureLossPolicy(pool, <loss policy call>)`. **/
export function configureLossPolicy<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi> | undefined = undefined,
>(
  ctx: GipBuilderContext,
  state: MarketState,
  abi: abi,
  call: ContractCall<abi, functionName>,
): RawTx {
  return ctx.marketConfigurator.configureLossPolicy(
    state.address,
    createCallData(abi, call as never),
  );
}

/** Forwards `<adapter call>` to the adapter of `target` in a credit manager. **/
export function configureAdapter<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi> | undefined = undefined,
>(
  ctx: GipBuilderContext,
  adapter: { creditManager: Address; target: Address },
  abi: abi,
  call: ContractCall<abi, functionName>,
): RawTx {
  return ctx.marketConfigurator.configureAdapterFor(
    adapter.creditManager,
    adapter.target,
    createCallData(abi, call as never),
  );
}

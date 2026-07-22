import type { MultichainSDK } from "../../MultichainSDK.js";
import type { PluginsMap } from "../../plugins/index.js";
import type {
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  GetLiquidatorWithdrawalsProps,
  ILiquidationsService,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidatorWithdrawal,
} from "./types.js";

/**
 * Cross-chain implementation of {@link ILiquidationsService}.
 *
 * Aggregates liquidatable accounts over all chains configured in
 * {@link MultichainSDK} (optionally restricted via
 * {@link GetLiquidatableAccountsProps.networks}). A failed chain is logged as
 * a warning and skipped, so one dead RPC does not empty the whole list.
 **/
export class MultichainLiquidationsService<
  const Plugins extends PluginsMap = {},
> implements ILiquidationsService
{
  readonly #sdk: MultichainSDK<Plugins>;

  constructor(sdk: MultichainSDK<Plugins>) {
    this.#sdk = sdk;
  }

  /**
   * {@inheritDoc ILiquidationsService.getLiquidatableAccounts}
   **/
  public async getLiquidatableAccounts(
    props?: GetLiquidatableAccountsProps,
  ): Promise<LiquidatableAccount[]> {
    const chains = [...this.#sdk.chains.entries()].filter(
      ([network]) => !props?.networks || props.networks.includes(network),
    );
    const results = await Promise.allSettled(
      chains.map(([, chainSdk]) =>
        chainSdk.liquidations.getLiquidatableAccounts(props),
      ),
    );
    const accounts: LiquidatableAccount[] = [];
    results.forEach((result, i) => {
      const [network, chainSdk] = chains[i];
      if (result.status === "fulfilled") {
        accounts.push(...result.value);
      } else {
        chainSdk.logger?.warn(
          result.reason,
          `failed to get liquidatable accounts on ${network}`,
        );
      }
    });
    return accounts;
  }

  /**
   * {@inheritDoc ILiquidationsService.getLiquidationDetails}
   **/
  public async getLiquidationDetails(
    props: GetLiquidationDetailsProps,
  ): Promise<LiquidationDetails> {
    return this.#sdk
      .chain(props.network)
      .liquidations.getLiquidationDetails(props);
  }

  /**
   * {@inheritDoc ILiquidationsService.getLiquidatorWithdrawals}
   **/
  public async getLiquidatorWithdrawals(
    props: GetLiquidatorWithdrawalsProps,
  ): Promise<LiquidatorWithdrawal[]> {
    const chains = [...this.#sdk.chains.entries()].filter(
      ([network]) => !props.networks || props.networks.includes(network),
    );
    const results = await Promise.allSettled(
      chains.map(([, chainSdk]) =>
        chainSdk.liquidations.getLiquidatorWithdrawals(props),
      ),
    );
    const withdrawals: LiquidatorWithdrawal[] = [];
    results.forEach((result, i) => {
      const [network, chainSdk] = chains[i];
      if (result.status === "fulfilled") {
        withdrawals.push(...result.value);
      } else {
        chainSdk.logger?.warn(
          result.reason,
          `failed to get liquidator withdrawals on ${network}`,
        );
      }
    });
    return withdrawals;
  }
}

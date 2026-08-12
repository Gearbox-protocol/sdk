import type { Address } from "viem";
import { creditAccountCompressorAbi } from "../../../abi/compressors/creditAccountCompressor.js";
import type { CreditAccountData } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { simulateWithPriceUpdates } from "../../utils/viem/index.js";
import type {
  CreditAccountDataCall,
  CreditAccountsCall,
  CreditAccountsQuery,
  CreditAccountsReadOptions,
  CreditAccountsTarget,
  GetCreditAccountsArgs,
} from "./types.js";

const abi = creditAccountCompressorAbi;
type abi = typeof abi;

/**
 * V3.10 credit account compressor.
 *
 * Wraps the compressor ABI and nothing else: single-account reads, paginated
 * multi-account reads, and call descriptors for callers that need to batch
 * these reads with calls to other contracts.
 **/
export class CreditAccountCompressorV310Contract extends BaseContract<abi> {
  readonly #sdk: OnchainSDK;

  constructor(sdk: OnchainSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "CreditAccountCompressorV310",
      abi,
      version: 310,
    });
    this.#sdk = sdk;
  }

  /**
   * Reads data of a single credit account.
   *
   * @param account - Credit account address.
   * @param blockNumber - Block to read at, defaults to the latest block.
   * @returns Account data, or `undefined` if the compressor reverted, which it
   * does when the account does not exist.
   **/
  public async getCreditAccountData(
    account: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountData | undefined> {
    try {
      return await this.client.readContract({
        abi,
        address: this.address,
        functionName: "getCreditAccountData",
        args: [account],
        blockNumber,
        // @ts-expect-error
        gas: this.#sdk.gasLimit,
      });
    } catch (_e) {
      // TODO: reverts if account is not found, how to handle other revert reasons?
      return undefined;
    }
  }

  /**
   * Reads all credit accounts matching the filters, in the order the
   * compressor returns them.
   *
   * Two compressor quirks are handled here: results are paginated, and the
   * `reverting` account filter is exclusive, so accounts whose collateral
   * computation reverts are only returned by a second pass.
   *
   * @param target - Credit managers to query.
   * @param query - Account-level filters, without `reverting`.
   * @param options - Block, price updates and page size.
   **/
  public async getCreditAccounts(
    target: CreditAccountsTarget,
    query: CreditAccountsQuery,
    options?: CreditAccountsReadOptions,
  ): Promise<Array<CreditAccountData>> {
    const { batchSize, blockNumber, priceUpdateTxs } = options ?? {};
    const allCAs: Array<CreditAccountData> = [];
    let revertingOffset = 0;
    // reverting filter is exclusive, we need both options to get all accounts
    for (const reverting of [false, true]) {
      let offset = 0n;
      revertingOffset = allCAs.length;
      do {
        const [accounts, newOffset] = await this.#getCreditAccounts(
          batchSize
            ? [
                target,
                { ...query, reverting },
                offset,
                batchSize, // limit
              ]
            : [target, { ...query, reverting }, offset],
          priceUpdateTxs,
          blockNumber,
        );
        allCAs.push(...accounts);
        offset = newOffset;
      } while (offset !== 0n);
    }
    this.logger?.debug(
      `loaded ${allCAs.length} credit accounts (${
        allCAs.length - revertingOffset
      } reverting)`,
    );
    return allCAs;
  }

  /**
   * Descriptor of a `getCreditAccountData` call on this compressor.
   **/
  public dataCall(account: Address): CreditAccountDataCall {
    return {
      abi,
      address: this.address,
      functionName: "getCreditAccountData",
      args: [account],
    };
  }

  /**
   * Descriptor of a `getCreditAccounts` call on this compressor.
   **/
  public accountsCall(args: GetCreditAccountsArgs): CreditAccountsCall {
    return {
      abi,
      address: this.address,
      functionName: "getCreditAccounts",
      args,
    };
  }

  /**
   * One page of `getCreditAccounts`, with price updates applied when the
   * accounts hold tokens with on-demand price feeds.
   **/
  async #getCreditAccounts(
    args: GetCreditAccountsArgs,
    priceUpdateTxs?: CreditAccountsReadOptions["priceUpdateTxs"],
    blockNumber?: bigint,
  ): Promise<[accounts: Array<CreditAccountData>, newOffset: bigint]> {
    let resp: [CreditAccountData[], bigint];
    if (priceUpdateTxs?.length) {
      [resp] = await simulateWithPriceUpdates(this.client, {
        priceUpdates: priceUpdateTxs,
        contracts: [this.accountsCall(args)],
        blockNumber,
        gas: this.#sdk.gasLimit,
      });
    } else {
      resp = await this.client.readContract<
        abi,
        "getCreditAccounts",
        GetCreditAccountsArgs
      >({
        abi,
        address: this.address,
        functionName: "getCreditAccounts",
        args,
        blockNumber,
        // @ts-expect-error
        gas: this.#sdk.gasLimit,
      });
    }

    this.logger?.debug(
      {
        accounts: resp[0]?.length ?? 0,
        nextOffset: Number(resp[1]),
      },
      "got credit accounts",
    );

    return resp;
  }
}

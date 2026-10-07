import {
  type Address,
  type Chain,
  type Hex,
  keccak256,
  type PublicClient,
  stringToHex,
  type Transport,
  toHex,
} from "viem";
import { BytecodeRepositoryContract } from "../../bindings/bytecode-repository.js";
import { PriceFeedStoreContract } from "../../bindings/price-feed-store.js";
import type { InputValueParams, PriceFeedParams } from "../../core/index.js";
import { Addresses } from "../../deployment/addresses.js";
import { encodeFunctionParams } from "../../utils/abi-encoder.js";
import type { ChainsNamespace } from "../chains/ChainsNamespace.js";
import {
  PriceFeedSaltMissingError,
  PriceFeedStalenessUnknownError,
} from "../errors.js";
import { deriveEffectiveStalenessPeriod } from "./effective-staleness.js";
import type {
  DeployContractArgs,
  DeployPriceFeedArgs,
  PreparedDeployment,
  PreparedPriceFeedDeployment,
} from "./types.js";

/**
 * Contract type whose first leg needs a bound this client reads off the chain,
 * see {@link PermissionlessDeploy.priceFeed}.
 **/
const COMPOSITE = "PRICE_FEED::COMPOSITE";

/** Label the composite's first leg arrives under. */
const COMPOSITE_FIRST_LEG = "underlyingPriceFeed-0";

/**
 * Salt a generic contract deploy gets when the caller does not name one. Two
 * deploys of the same type and arguments by the same owner collide under it,
 * which for a singleton like a pause committee is the point.
 **/
export const DEFAULT_DEPLOY_SALT: Hex = stringToHex("SALT", { size: 32 });

/**
 * The salt a price feed is deployed under, derived from its name so that two
 * feeds of the same type and arguments get different addresses.
 **/
export function priceFeedSalt(name: string): Hex {
  return keccak256(toHex(name));
}

/**
 * Deploys through the BytecodeRepository: the constructor arguments it wants,
 * the CREATE2 address those produce, and the transaction that gets there.
 *
 * Entirely on-chain — no backend is involved, every answer is derived from the
 * target chain. Nothing is sent either: a browser holds the only wallet, so a
 * call prepares the deploy and the caller sends
 * {@link PreparedDeployment.tx} with whatever signs for them.
 *
 * ```ts
 * const feed = await permissionless.deploy.priceFeed({
 *   chainId: 1,
 *   owner: account,
 *   contractType: "PRICE_FEED::CHAINLINK",
 *   version: 310,
 *   name: "WETH / USD",
 *   values,
 * });
 * if (!feed.isAlreadyDeployed) {
 *   await sendRawTx(wallet, { tx: feed.tx });
 * }
 * ```
 **/
export class PermissionlessDeploy {
  readonly #chains: ChainsNamespace;

  constructor(chains: ChainsNamespace) {
    this.#chains = chains;
  }

  /**
   * Prepares a price feed deploy from the values a form collected: encodes
   * them the way the PriceFeedStore reads them back, and reports where the
   * feed will land.
   *
   * A COMPOSITE's first leg is the one case where the values are not taken as
   * given. It arrives with `stalenessPeriod` 0 whenever it is a derived feed,
   * because the store registers those with 0 and rejects anything else — which
   * says nothing about what the leg itself enforces. A composite built on that
   * 0 can never pass its own staleness check, so the real bound is read off
   * the leg, see {@link deriveEffectiveStalenessPeriod}.
   *
   * The deployed feed is not known to the backend yet; record it with
   * {@link PermissionlessOracles.registerDeployed} once the transaction lands.
   **/
  public async priceFeed(
    args: DeployPriceFeedArgs,
  ): Promise<PreparedPriceFeedDeployment> {
    const client = this.#chains.client(args.chainId);
    const salt = this.#priceFeedSalt(args);
    const values =
      args.contractType === COMPOSITE
        ? await this.#withDerivedStaleness(client, args.values)
        : args.values;

    const store = new PriceFeedStoreContract(
      Addresses.PRICE_FEED_STORE,
      client,
    );
    const encodedParams = await store.encodeConstructorParams(
      args.contractType,
      args.version,
      values,
    );

    const prepared = await this.#prepare(client, {
      contractType: args.contractType,
      version: args.version,
      owner: args.owner,
      encodedParams,
      salt,
    });
    return { ...prepared, values };
  }

  /**
   * Prepares a generic contract deploy from ABI type/value pairs.
   *
   * Unlike a price feed, the arguments here are already typed by the caller,
   * so nothing is looked up: they are encoded as given and the address they
   * produce is reported.
   **/
  public async contract(args: DeployContractArgs): Promise<PreparedDeployment> {
    const client = this.#chains.client(args.chainId);
    return this.#prepare(client, {
      contractType: args.contractType,
      version: args.version,
      owner: args.owner,
      encodedParams: encodeFunctionParams(args.values),
      salt: args.salt ?? DEFAULT_DEPLOY_SALT,
    });
  }

  /**
   * Where the encoded deploy lands, whether it is already there, and the
   * transaction that puts it there.
   **/
  async #prepare(
    client: PublicClient<Transport, Chain>,
    args: {
      contractType: string;
      version: number;
      owner: Address;
      encodedParams: Hex;
      salt: Hex;
    },
  ): Promise<PreparedDeployment> {
    const repository = new BytecodeRepositoryContract(
      Addresses.BYTECODE_REPOSITORY,
      client,
    );
    const [isAlreadyDeployed, address] =
      await repository.isAlreadyDeployedAddress(args);

    return {
      ...args,
      address,
      isAlreadyDeployed,
      tx: repository.deployTx({
        contractType: args.contractType,
        version: BigInt(args.version),
        encodedParams: args.encodedParams,
        salt: args.salt,
      }),
    };
  }

  /**
   * The values with the composite's first leg given the bound it actually
   * enforces, when it came in without one.
   **/
  async #withDerivedStaleness(
    client: PublicClient<Transport, Chain>,
    values: Record<string, InputValueParams>,
  ): Promise<Record<string, InputValueParams>> {
    const leg = values[COMPOSITE_FIRST_LEG] as PriceFeedParams | undefined;
    if (
      !leg ||
      typeof leg !== "object" ||
      !leg.address ||
      leg.stalenessPeriod !== 0
    ) {
      return values;
    }

    const derived = await deriveEffectiveStalenessPeriod(client, leg.address);
    if (derived === null) {
      throw new PriceFeedStalenessUnknownError(leg.address);
    }

    return {
      ...values,
      [COMPOSITE_FIRST_LEG]: { ...leg, stalenessPeriod: derived },
    };
  }

  #priceFeedSalt(args: DeployPriceFeedArgs): Hex {
    if (args.salt) {
      return args.salt;
    }
    if (!args.name) {
      throw new PriceFeedSaltMissingError();
    }
    return priceFeedSalt(args.name);
  }
}

import { type Address, BaseError } from "viem";

/**
 * Thrown when anything is read off {@link ChainsNamespace} before
 * {@link GearboxPermissionless.attach} has completed.
 *
 * The chain list is the backend's answer, so there is nothing to report until
 * it arrives. Answering with an empty list instead would be indistinguishable
 * from a backend that serves no chains at all.
 **/
export class PermissionlessNotAttachedError extends BaseError {
  override name = "PermissionlessNotAttachedError";

  constructor() {
    super("The client has not attached yet.", {
      metaMessages: ["Await `attach()` before reading chains off the client."],
    });
  }
}

/**
 * Thrown when a call has to read a chain the client holds no viem client for.
 *
 * Either the backend does not serve the chain, or it serves one this SDK
 * carries no definition for: endpoints come from the chain definition, since
 * the backend's own urls carry provider keys and are never handed out.
 **/
export class PermissionlessChainUnreachableError extends BaseError {
  override name = "PermissionlessChainUnreachableError";

  /** Chain that was asked for. */
  public readonly chainId: number;

  constructor(chainId: number) {
    super(`Chain ${chainId} cannot be read directly.`, {
      metaMessages: [
        "The backend either does not serve it, or serves a chain this SDK has no definition for.",
      ],
    });
    this.chainId = chainId;
  }
}

/**
 * Thrown when a rename names a feed the PriceFeedStore does not carry. A name
 * is part of what the store holds, so there is nothing to change on a feed
 * that never reached it.
 **/
export class PriceFeedNotInStoreError extends BaseError {
  override name = "PriceFeedNotInStoreError";

  /** Feed that was named. */
  public readonly priceFeed: Address;
  public readonly chainId: number;

  constructor(priceFeed: Address, chainId: number) {
    super(
      `Price feed ${priceFeed} is not in the PriceFeedStore of chain ${chainId}.`,
      {
        metaMessages: [
          "Only a feed the store already carries can be renamed; add it first.",
        ],
      },
    );
    this.priceFeed = priceFeed;
    this.chainId = chainId;
  }
}

/**
 * Thrown when a composite feed names a leg whose own staleness bound cannot be
 * read off the chain.
 *
 * Deploying with a placeholder is not an option: a composite whose check can
 * never pass reverts on every read, and the store will not take it. The bound
 * has to be set on the leg first.
 **/
export class PriceFeedStalenessUnknownError extends BaseError {
  override name = "PriceFeedStalenessUnknownError";

  /** Leg whose bound could not be determined. */
  public readonly priceFeed: Address;

  constructor(priceFeed: Address) {
    super(`Cannot determine the staleness period of price feed ${priceFeed}.`, {
      metaMessages: [
        "Deploying with a placeholder would make this composite permanently stale.",
        "Set the staleness period on the underlying feed first.",
      ],
    });
    this.priceFeed = priceFeed;
  }
}

/**
 * Thrown when a price feed deploy names neither a salt nor the name one would
 * be derived from, leaving CREATE2 nothing to distinguish it by.
 **/
export class PriceFeedSaltMissingError extends BaseError {
  override name = "PriceFeedSaltMissingError";

  constructor() {
    super("A price feed deploy needs either `salt` or `name`.", {
      metaMessages: [
        "`name` is hashed into the salt, which is what keeps two feeds of the",
        "same type and arguments from landing on the same address.",
      ],
    });
  }
}

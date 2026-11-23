import { type Address, BaseError } from "viem";

/** A well-formed signer response failed EIP-712 verification or request matching. */
export class OpeningSignerVerificationError extends BaseError {
  override name = "OpeningSignerVerificationError";

  constructor(
    public readonly url: string,
    public readonly signer: Address,
    cause?: Error,
  ) {
    super("Opening signer response does not match the requested approval.", {
      cause,
      metaMessages: [`URL: ${url}`, `Expected signer: ${signer}`],
    });
  }
}

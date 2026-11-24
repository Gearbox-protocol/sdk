import { type Address, BaseError } from "viem";

/** The selected opening entry point cannot forward signature data to the NFT. */
export class UnsupportedOpeningApprovalError extends BaseError {
  override name = "UnsupportedOpeningApprovalError";

  constructor(public readonly facade: Address) {
    super(
      "Inline opening signatures require a direct v311 or newer credit facade.",
      {
        metaMessages: [`Credit facade: ${facade}`],
      },
    );
  }
}

/** The supplied approval does not apply to the requested account operation. */
export class InvalidOpeningApprovalError extends BaseError {
  override name = "InvalidOpeningApprovalError";
}

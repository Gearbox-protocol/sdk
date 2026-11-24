/** Distinct signers did not supply enough approvals for any single digest. */
export class OpeningSignerQuorumError extends AggregateError {
  override name = "OpeningSignerQuorumError";

  constructor(
    causes: readonly unknown[],
    public readonly required: number,
  ) {
    super(
      causes,
      `Opening signers did not return ${required} approvals for the same digest.`,
    );
  }
}

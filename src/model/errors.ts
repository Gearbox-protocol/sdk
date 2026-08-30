/**
 * The failure vocabulary the SDK answers in.
 *
 * A request that the protocol, the market or the request's own numbers rule out
 * is not an exception: it is an answer, and a screen shows it the way it shows
 * any other. So a method that can be refused returns an {@link SDKReturn}
 * envelope rather than throwing, and what it puts in the failure half is one of
 * these — never a bare string, never a boolean the caller has to interpret.
 *
 * A thrown exception still means what it always did: the SDK could not do its
 * job (a read failed, a contract reverted unexpectedly, an argument is wrong).
 * Those are bugs and outages, not verdicts on the request.
 **/

/**
 * What every error the SDK reports has.
 *
 * `code` is the discriminant: switch on it and the error narrows to the shape
 * carrying that failure's own numbers, so a caller reads `available` and
 * `required` off the error rather than re-deriving them from the request.
 *
 * The codes themselves are per namespace — there is no SDK-wide enumeration of
 * them, because the set a method can answer with is part of that method's
 * contract, see the `E` of {@link SDKReturn}.
 **/
export interface IGearboxError {
  /**
   * Machine-readable identity of the failure, and the discriminant of the
   * union a method returns.
   **/
  code: string;
  /**
   * One sentence naming what was refused, in English, safe to log. Not a
   * message to show a user as-is: a screen renders the code and the numbers
   * beside it in its own words and its own language.
   **/
  message: string;
  /**
   * The failure this one was raised for, where one error stands in front of
   * another. Absent for a refusal that is its own reason, which is most of
   * them.
   **/
  cause?: IGearboxError | Error;
}

/**
 * What every error the SDK reports has.
 *
 * `code` is the discriminant: switch on it and the error narrows to the shape
 * carrying that failure's own numbers.
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

/**
 * The health-factor thresholds this codebase holds an account to.
 *
 * They are deliberately different numbers for different jobs: the facade's is
 * what a transaction must clear to land, a form's is what makes a position
 * worth signing, and a sizing helper leaves a margin above both.
 **/

/** A factor at or below this is refused; kept for the callers that size on it. */
export const MIN_HF_LIMITED = 10100n;

/** The same threshold as a `required` argument — the lowest factor that passes. */
export const MIN_HEALTH_FACTOR_FORM = 10_101;

/** The threshold the facade itself enforces: an account may end exactly at 1.0. */
export const MIN_HEALTH_FACTOR_FACADE = 10_000;

/**
 * The safe-price threshold a form holds an account to. A step above the
 * facade's, because a factor of exactly 1.0 at safe prices is already refused.
 **/
export const MIN_SAFE_HEALTH_FACTOR_FORM = 10_001;

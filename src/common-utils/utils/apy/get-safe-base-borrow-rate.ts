import {
  type CalculateBorrowRateSafelyProps,
  calculateSafeBorrowRate,
} from "./calculate-safe-borrow-rate.js";

export const getSafeBaseBorrowRate = (
  props: CalculateBorrowRateSafelyProps & {
    onError?: (error: unknown) => void;
  },
) => {
  const { onError, ...rest } = props;
  try {
    const rate = calculateSafeBorrowRate(rest);
    return rate;
  } catch (e) {
    onError?.(e);
    return undefined;
  }
};

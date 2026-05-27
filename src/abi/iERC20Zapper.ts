import { ierc20ZapperDepositsAbi } from "./iERC20ZapperDeposits.js";
import { iZapperAbi } from "./iZapper.js";

export const ierc20ZapperAbi = [
  ...ierc20ZapperDepositsAbi,
  ...iZapperAbi,
] as const;

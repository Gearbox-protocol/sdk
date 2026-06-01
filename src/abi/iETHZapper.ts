import { iethZapperDepositsAbi } from "./iETHZapperDeposits.js";
import { iZapperAbi } from "./iZapper.js";

export const iethZapperAbi = [...iethZapperDepositsAbi, ...iZapperAbi] as const;

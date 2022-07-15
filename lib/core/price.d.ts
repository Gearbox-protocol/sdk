import { BigNumber } from "ethers";
import { TokenData } from "../tokens/tokenData";
export declare const PRICE_DECIMALS = 1000;
export declare const priceCalc: (price: number, amount: BigNumber, token: TokenData | undefined) => BigNumber;

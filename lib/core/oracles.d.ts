import { BigNumberish } from "ethers";
export interface YearnPriceFeedConfig {
    yVault: string;
    lowerBound: BigNumberish;
    upperBound: BigNumberish;
}

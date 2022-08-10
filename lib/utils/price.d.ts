import { BigNumber } from "ethers";
export declare const calcTotalPrice: (price: BigNumber, amount: BigNumber, decimals?: number) => BigNumber;
interface Target {
    price: BigNumber;
    decimals: number | undefined;
}
export declare function convertByPrice(totalMoney: BigNumber, { price: targetPrice, decimals: targetDecimals }: Target): BigNumber;
export {};

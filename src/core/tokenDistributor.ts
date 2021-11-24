import { BigNumberish } from "ethers";

export interface TokenShare {
  holder: string;
  amount: BigNumberish;
  isCompany: boolean;
}

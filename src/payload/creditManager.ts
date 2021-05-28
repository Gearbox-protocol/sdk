import {BigNumberish} from "ethers";

export interface CreditManagerDataPayload {
  addr: string;
  hasAccount?: boolean;
  kind?: string
  underlyingToken?: string;
  isWETH?: boolean;
  canBorrow?: boolean;
  borrowRate?: BigNumberish;
  minAmount?: BigNumberish;
  maxAmount?: BigNumberish;
  maxLeverageFactor?: BigNumberish;
  availableLiquidity?: BigNumberish;
  allowedTokens?: Array<string>;
  allowedContracts?: Array<string>;
}


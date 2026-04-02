import type { Address } from "viem";

export type TradingType = "long" | "short";

export interface TradingPairConfigPayload {
  name: string;
  type: TradingType;
  // trading pair identifier, e.g. "WETHUSDC"; long and short version of the pair should have the same id
  // is used as key in the pairs list
  id: string;
  // token address of the pair
  tokenOutAddress: Address;
  // token address of token without yield tokenOut is based on (ex. WETH for tokenOut=STETH)
  baseOfTokenOutAddress?: Address;
  // tuple of token symbols of CM underlying token and token out; long and short version of the pair should have the same pricePair
  // should be equal to sdk-gov-legacy SupportedSymbol or, if token is not present in that list, should be equal to symbol which provides sdk
  pricePair: [string, string];
  // chain id and network type as they are written in sdk. wrong entries are being omitted
  chainId: number;
  network: string;
  // if the chain doesn't have credit managers - pair won't be shown on that chain
  creditManagers: Array<Address>;

  // an options to show strategies in dev environment only
  // undefined, false = no
  hideInProd?: boolean;

  /*
   undefined - no restrictions
   number - one value for the current chain
  */
  maxLeverage?: number;
}

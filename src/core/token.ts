import { BigNumber } from "ethers";
import { TokenDataPayload } from "../payload/token";
import { ICONS } from "../icons";

export class TokenData {
  public readonly id: string;
  // public readonly name: string;
  public readonly symbol: string;
  public readonly address: string;
  public readonly decimals: number;
  public readonly icon?: string;

  constructor(payload: TokenDataPayload) {
    this.id = payload.addr;
    this.address = payload.addr;
    // this.name = payload.name;
    this.symbol = payload.symbol;
    if (this.symbol === "WETH" || this.symbol === "dWETH") {
      this.symbol = this.symbol.replace("WETH", "ETH");
    }
    this.decimals = payload.decimals;
    this.icon = ICONS[payload.symbol?.toLowerCase()];
  }
}

export interface TokenBalance {
  id: string;
  balance: BigNumber;
}

export interface TokenAllowance {
  id: string;
  allowance: BigNumber;
}

// export function showBalance(token?: TokenInfo) : string {
//   if (!token || !token.balance || !token.decimals) return "-";
//   return toSignificant(token.balance, token.decimals);
// }
//

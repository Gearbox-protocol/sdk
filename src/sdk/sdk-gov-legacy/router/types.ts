import type { Address } from "viem";

import type { TokenType } from "../tokens";
import type { RouterComponent } from "./components";

export interface RouterComponentRegister {
  routerComponent: RouterComponent;
  address: Address;
}

export interface TokenTypeToResolver {
  tokenType0: TokenType;
  tokenType1: TokenType;
  resolver: RouterComponent;
}

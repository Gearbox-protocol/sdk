import { RouterComponent, TokenType } from "@gearbox-protocol/sdk-gov";
import { BaseContractStateHuman, convertBaseContractState } from "./stateHuman";
import { RouterState, RouterV3ContractState } from "./routerState";
import { Address } from "viem";

export interface RouterComponentRegisterHuman {
  routerComponent: string;
  address: string;
}

export interface TokenTypeToResolverHuman {
  tokenType0: string;
  tokenType1: string;
  resolver: string;
}

export interface RouterV3ContractStateHuman extends BaseContractStateHuman {
  components: Array<RouterComponentRegisterHuman>;
  tokenTypesToResolver: Array<TokenTypeToResolverHuman>;
  tokensAdded: Array<string>;
}

export interface RouterStateHuman {
  router: RouterV3ContractStateHuman;
}

export function convertRouterV3StateToHuman(
  state: RouterV3ContractState,
  labelAddress: (address: Address) => string,
  raw = true,
): RouterV3ContractStateHuman {
  return {
    ...convertBaseContractState(state, labelAddress),
    components: state.components.map(c => ({
      routerComponent: RouterComponent[c.routerComponent],
      address: labelAddress(c.address),
    })),
    tokenTypesToResolver: state.tokenTypesToResolver.map(t => ({
      tokenType0: TokenType[t.tokenType0],
      tokenType1: TokenType[t.tokenType1],
      resolver: RouterComponent[t.resolver],
    })),
    tokensAdded: state.tokensAdded.map(labelAddress),
  };
}

export function convertRouterStateToHuman(
  state: RouterState,
  labelAddress: (address: Address) => string,
  raw = true,
): RouterStateHuman {
  return {
    router: convertRouterV3StateToHuman(state.router, labelAddress, raw),
  };
}

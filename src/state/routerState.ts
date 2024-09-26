import { Address } from "viem";

import { BaseContractState } from "./state";
import {
  RouterComponentRegister,
  TokenTypeToResolver,
} from "@gearbox-protocol/sdk-gov";

export interface RouterV3ContractState extends BaseContractState {
  components: Array<RouterComponentRegister>;
  tokenTypesToResolver: Array<TokenTypeToResolver>;
  tokensAdded: Array<Address>;
}

export interface RouterState {
  router: RouterV3ContractState;
}

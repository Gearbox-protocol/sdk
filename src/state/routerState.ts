import type {
  RouterComponentRegister,
  TokenTypeToResolver,
} from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import type { BaseContractState } from "./state";

export interface RouterV3ContractState extends BaseContractState {
  components: Array<RouterComponentRegister>;
  tokenTypesToResolver: Array<TokenTypeToResolver>;
  tokensAdded: Array<Address>;
}

export interface RouterState {
  router: RouterV3ContractState;
}

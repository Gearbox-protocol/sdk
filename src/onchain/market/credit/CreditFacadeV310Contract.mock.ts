import { createPublicClient, custom, getAddress, stringToHex } from "viem";
import { mainnet } from "viem/chains";

import type { CreditSuiteState } from "../../base/index.js";
import { ChainContractsRegister } from "../../base/index.js";
import { ADDRESS_0X0 } from "../../constants/index.js";
import { CreditFacadeV310Contract } from "./CreditFacadeV310Contract.js";

export const TEST_FACADE_ADDRESS = getAddress(
  "0xFACADE0000000000000000000000000000000310",
);
export const TEST_UNDERLYING_ADDRESS = getAddress(
  "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
);
export const TEST_CREDIT_MANAGER_NAME = "TestCM";

/**
 * Register shared by every contract built here, so that contracts can resolve
 * each other (e.g. the facade parsing adapter calldata). Its client rejects any
 * RPC request: helpers only build contracts, they never talk to a node.
 */
export const testContractsRegister = new ChainContractsRegister(
  createPublicClient({
    chain: mainnet,
    transport: custom({
      request: async () => {
        throw new Error("not implemented");
      },
    }),
  }),
);

/**
 * Builds a `CreditFacadeV310Contract` over {@link testContractsRegister} with
 * placeholder state, for tests that only need encoding or calldata parsing.
 */
export function makeTestFacade(): CreditFacadeV310Contract {
  return new CreditFacadeV310Contract({ register: testContractsRegister }, {
    creditFacade: {
      baseParams: {
        addr: TEST_FACADE_ADDRESS,
        version: 310n,
        contractType: stringToHex("CF", { size: 32 }),
        serializedParams: "0x",
      },
      degenNFT: ADDRESS_0X0,
      botList: ADDRESS_0X0,
      expirable: false,
      expirationDate: 0,
      maxDebtPerBlockMultiplier: 4,
      minDebt: 0n,
      maxDebt: 0n,
      forbiddenTokensMask: 0n,
      isPaused: false,
    },
    creditManager: {
      name: TEST_CREDIT_MANAGER_NAME,
      underlying: TEST_UNDERLYING_ADDRESS,
    },
  } as unknown as CreditSuiteState);
}

import { type Address, getAddress } from "viem";
import { expect, it } from "vitest";

import {
  RWA_FACTORY_SECURITIZE,
  type RWAOperationParams,
  SECURITIZE_REGISTER_VAULT_TYPES,
  type SecuritizeOpenAccountRequirements,
  type SecuritizeRegisterMessage,
  type SecuritizeRegisterVaultMessage,
} from "../../sdk/index.js";
import { RWAOpenRequirementsPrerequisite } from "./RWAOpenRequirementsPrerequisite.js";

const FACTORY: Address = getAddress(
  "0xc6f7B95f6fb8394541D9Ac8B0Abc94Bf6E84F703",
);
const DS_TOKEN: Address = getAddress(
  "0x17418038ecf73BA4026C4F428547Bf099706F27B",
);
const OTHER_TOKEN: Address = getAddress(
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
);
const INVESTOR: Address = getAddress(
  "0xf13df765f3047850Cede5aA9fDF20a12A75f7F70",
);
const OPERATOR: Address = getAddress(
  "0x04Ac894088fDd6fD622D9fe7c39192BafAeA15dB",
);

const FUTURE_DEADLINE = BigInt(Math.floor(Date.now() / 1000)) + 3600n;
const PAST_DEADLINE = BigInt(Math.floor(Date.now() / 1000)) - 3600n;

function registerVaultMessage(token: Address): SecuritizeRegisterVaultMessage {
  return {
    types: SECURITIZE_REGISTER_VAULT_TYPES,
    primaryType: "RegisterVault",
    domain: {
      name: "VaultRegistrar",
      version: "1",
      chainId: 1n,
      verifyingContract: FACTORY,
    },
    message: {
      investor: INVESTOR,
      operator: OPERATOR,
      token,
      nonce: 0n,
      deadline: FUTURE_DEADLINE,
    },
  };
}

function requirements(
  overrides?: Partial<SecuritizeOpenAccountRequirements>,
): SecuritizeOpenAccountRequirements {
  return {
    type: RWA_FACTORY_SECURITIZE,
    securitizeTokensToRegister: [],
    tokensToRegister: [DS_TOKEN],
    requiredSignatures: [registerVaultMessage(DS_TOKEN)],
    ...overrides,
  };
}

function providedSignature(
  token: Address,
  deadline: bigint,
): SecuritizeRegisterMessage {
  return {
    token,
    signature: { deadline, signature: `0x${"ab".repeat(65)}` },
  };
}

function provided(
  signaturesToCache: SecuritizeRegisterMessage[],
): RWAOperationParams {
  return {
    type: RWA_FACTORY_SECURITIZE,
    tokensToRegister: [DS_TOKEN],
    signaturesToCache,
  };
}

function resolve(props: {
  requirements: SecuritizeOpenAccountRequirements;
  provided?: RWAOperationParams;
}) {
  return new RWAOpenRequirementsPrerequisite({
    ...props,
    token: DS_TOKEN,
    factory: FACTORY,
  }).resolve([]);
}

it("is unsatisfied when a signature is required and nothing is provided", () => {
  const result = resolve({ requirements: requirements() });
  expect(result.satisfied).toBe(false);
});

it("is satisfied when no signatures or registrations are required", () => {
  const result = resolve({
    requirements: requirements({ requiredSignatures: [] }),
  });
  expect(result.satisfied).toBe(true);
});

it("is satisfied when calldata provides the required signature with a future deadline", () => {
  const result = resolve({
    requirements: requirements(),
    provided: provided([providedSignature(DS_TOKEN, FUTURE_DEADLINE)]),
  });
  expect(result.satisfied).toBe(true);
});

it("treats token addresses case-insensitively", () => {
  const result = resolve({
    requirements: requirements(),
    provided: provided([
      providedSignature(DS_TOKEN.toLowerCase() as Address, FUTURE_DEADLINE),
    ]),
  });
  expect(result.satisfied).toBe(true);
});

it("is unsatisfied when the provided signature has expired", () => {
  const result = resolve({
    requirements: requirements(),
    provided: provided([providedSignature(DS_TOKEN, PAST_DEADLINE)]),
  });
  expect(result.satisfied).toBe(false);
});

it("is unsatisfied when the provided signature is for a different token", () => {
  const result = resolve({
    requirements: requirements(),
    provided: provided([providedSignature(OTHER_TOKEN, FUTURE_DEADLINE)]),
  });
  expect(result.satisfied).toBe(false);
});

it("is unsatisfied when issuer-side registration is pending, even with signatures provided", () => {
  const result = resolve({
    requirements: requirements({ securitizeTokensToRegister: [DS_TOKEN] }),
    provided: provided([providedSignature(DS_TOKEN, FUTURE_DEADLINE)]),
  });
  expect(result.satisfied).toBe(false);
});

it("keeps the detail equal to the original requirements", () => {
  const reqs = requirements();
  const result = resolve({
    requirements: reqs,
    provided: provided([providedSignature(DS_TOKEN, FUTURE_DEADLINE)]),
  });
  expect(result.detail).toEqual(reqs);
});

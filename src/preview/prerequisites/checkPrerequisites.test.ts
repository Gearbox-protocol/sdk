import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  type Address,
  custom,
  decodeFunctionData,
  encodeFunctionData,
  getAddress,
  type Hex,
} from "viem";
import { beforeAll, expect, it, vi } from "vitest";

import { iSecuritizeRWAFactoryAbi } from "../../abi/rwa/iSecuritizeRWAFactory.js";
import { AdaptersPlugin } from "../../plugins/adapters/index.js";
import {
  json_parse,
  OnchainSDK,
  RWA_FACTORY_SECURITIZE,
  SECURITIZE_REGISTER_VAULT_TYPES,
  type SecuritizeInvestorData,
  type SecuritizeRegisterVaultMessage,
} from "../../sdk/index.js";
import { checkPrerequisites } from "./checkPrerequisites.js";
import type { RWAOpenRequirementsResult } from "./RWAOpenRequirementsPrerequisite.js";

const FIXTURE = resolve(
  import.meta.dirname,
  "../__fixtures__/Mainnet-25432463-securitize.json",
);

const SENDER: Address = "0xf13df765f3047850Cede5aA9fDF20a12A75f7F70";
const FACTORY: Address = "0xc6f7B95f6fb8394541D9Ac8B0Abc94Bf6E84F703";
// Securitize DSToken quoted by the operation's `updateQuota` call
const DS_TOKEN: Address = "0x17418038ecF73BA4026c4f428547BF099706F27B";
const OPERATOR: Address = "0x04Ac894088fDd6fD622D9fe7c39192BafAeA15dB";
const SPENDER: Address = "0x0000000000000000000000000000000000000001";

const DUMMY_SIGNATURE: Hex = `0x${"ab".repeat(65)}`;

// `openCreditAccount` transaction to the Securitize RWA factory, built by the
// frontend against Mainnet. Its `tokensToRegister`/`signaturesToCache` args
// carry the DSToken and the investor's registration signature.
const OPEN_CALLDATA: Hex =
  "0x9cc9984d000000000000000000000000025512d771f778fad99ab30b7a7363e7c8de078d000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000006a000000000000000000000000000000000000000000000000000000000000006e0000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000000034000000000000000000000000000000000000000000000000000000000000003e000000000000000000000000000000000000000000000000000000000000004a00000000000000000000000000000000000000000000000000000000000000520000000000000000000000000ec6b8d8e18d48cb4df7028b8e1aa1662e966cd86000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000242b7c7b110000000000000000000000000000000000000000000000000000000dce8e310000000000000000000000000000000000000000000000000000000000000000000000000000000000ec6b8d8e18d48cb4df7028b8e1aa1662e966cd86000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000446d75b9ee000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000002540be40000000000000000000000000000000000000000000000000000000000000000000000000000000000ec6b8d8e18d48cb4df7028b8e1aa1662e966cd86000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000842f2ca49b0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000017418038ecf73ba4026c4f428547bf099706f27b0000000000000000000000000000000000000000000000000000000003bda2b30000000000000000000000000000000000000000000000000000000000000000000000000000000004ac894088fdd6fd622d9fe7c39192bafaea15db000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000240acb320200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000051182e7f0fa35e669f49c40007020fb369344f12000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000448375a4760000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ec6b8d8e18d48cb4df7028b8e1aa1662e966cd8600000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000004f42aeb0000000000000000000000000000000000000000000000000000000000000000000000000000000000ec6b8d8e18d48cb4df7028b8e1aa1662e966cd8600000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000064712c10ad00000000000000000000000017418038ecf73ba4026c4f428547bf099706f27b0000000000000000000000000000000000000000000000000000000f404086800000000000000000000000000000000000000000000000000000000f3c58ec1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000017418038ecf73ba4026c4f428547bf099706f27b0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000017418038ecf73ba4026c4f428547bf099706f27b0000000000000000000000000000000000000000000000000000000000000040ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000410b1cf218db0a731ba7446bb093306cd809b249c79a20287279a8cb1dc64bb6bc359652b02a9fd5d1f4d5b3dec6c457bcad2225a8cec41441ee0fd1090165f5ef1c00000000000000000000000000000000000000000000000000000000000000";

let sdk: OnchainSDK<{ adapters: AdaptersPlugin }>;

beforeAll(() => {
  // Default client throws on any RPC request: hydration, calldata parsing
  // and prerequisite building must be fully offline (the two RPC-dependent
  // reads are stubbed below).
  sdk = new OnchainSDK(
    "Mainnet",
    {
      transport: custom({
        request: async () => {
          throw new Error("offline: prerequisites test must not hit RPC");
        },
      }),
    },
    { plugins: { adapters: new AdaptersPlugin(true) } },
  );
  sdk.hydrate(json_parse(readFileSync(FIXTURE, "utf-8")));

  // Investor state from the RWA compressor: the investor is registered with
  // the issuer, but the registration signature is not cached on-chain yet, so
  // it must either be signed or already included in the transaction calldata.
  const investorData: SecuritizeInvestorData = {
    type: RWA_FACTORY_SECURITIZE,
    factory: FACTORY,
    creditAccounts: [],
    registeredTokens: [DS_TOKEN],
    cachedSignatures: [],
    registerVaultMessages: [registerVaultMessage(DS_TOKEN)],
  };
  vi.spyOn(sdk.rwa, "getInvestorData").mockResolvedValue([investorData]);
  vi.spyOn(sdk.accounts, "getApprovalAddress").mockResolvedValue(SPENDER);
});

function registerVaultMessage(
  token: Address,
  deadline: bigint = 2n ** 256n - 1n,
): SecuritizeRegisterVaultMessage {
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
      investor: SENDER,
      operator: OPERATOR,
      token,
      nonce: 0n,
      deadline,
    },
  };
}

/** Same operation as {@link OPEN_CALLDATA} re-encoded with the given params. */
function calldataWith(
  tokensToRegister: Address[],
  signaturesToCache: { token: Address; deadline: bigint }[],
): Hex {
  const { args } = decodeFunctionData({
    abi: iSecuritizeRWAFactoryAbi,
    data: OPEN_CALLDATA,
  });
  const [creditManager, calls] = args as unknown as [Address, unknown[]];
  return encodeFunctionData({
    abi: iSecuritizeRWAFactoryAbi,
    functionName: "openCreditAccount",
    args: [
      creditManager,
      calls,
      tokensToRegister,
      signaturesToCache.map(({ token, deadline }) => ({
        token,
        signature: { deadline, signature: DUMMY_SIGNATURE },
      })),
    ] as never,
  });
}

async function resolveRWAResult(
  calldata: Hex,
): Promise<RWAOpenRequirementsResult> {
  const results = await checkPrerequisites({
    sdk,
    to: FACTORY,
    calldata,
    sender: SENDER,
  });
  const rwa = results.find(
    (r): r is RWAOpenRequirementsResult => r.kind === "rwaOpenRequirements",
  );
  expect(rwa).toBeDefined();
  return rwa!;
}

it("is satisfied when the required signature is included in calldata", async () => {
  const rwa = await resolveRWAResult(OPEN_CALLDATA);
  expect(rwa.satisfied).toBe(true);
  expect(rwa.detail.missing).toBeUndefined();
});

it("is unsatisfied for template calldata without registration params", async () => {
  const rwa = await resolveRWAResult(calldataWith([], []));
  expect(rwa.satisfied).toBe(false);
  // The detail carries both the missing subset and the raw requirements.
  expect(rwa.detail).toMatchObject({
    token: DS_TOKEN,
    factory: FACTORY,
    requirements: {
      type: RWA_FACTORY_SECURITIZE,
      securitizeTokensToRegister: [],
      tokensToRegister: [DS_TOKEN],
      requiredSignatures: [{ message: { token: DS_TOKEN } }],
    },
    missing: {
      type: RWA_FACTORY_SECURITIZE,
      requiredSignatures: [{ message: { token: DS_TOKEN } }],
    },
  });
});

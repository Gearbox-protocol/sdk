import { type Address, hashTypedData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  OpeningSignerResponse,
  RequiredOpeningApproval,
} from "../../model/openingApproval.js";
import {
  OffchainInvalidJsonError,
  OffchainRequestFailedError,
  OffchainStatusError,
  OffchainValidationError,
  OpeningSignerError,
  OpeningSignerQuorumError,
  OpeningSignerVerificationError,
} from "../errors/index.js";
import { OffchainOpportunities } from "./OffchainOpportunities.js";

const accounts = [1, 2].map(i =>
  privateKeyToAccount(
    i === 1 ? `0x${"01".repeat(32)}` : `0x${"02".repeat(32)}`,
  ),
);
const cm: Address = "0x1111111111111111111111111111111111111111";
const owner: Address = "0x2222222222222222222222222222222222222222";
const nft: Address = "0x3333333333333333333333333333333333333333";
const req: RequiredOpeningApproval = {
  status: "signaturesRequired",
  chainId: 1,
  marketConfigurator: cm,
  creditManager: cm,
  accountOwner: owner,
  degenNFT: nft,
  nonce: 1,
  minSignaturesRequired: 1,
  authorizedSigners: accounts.map(a => a.address),
};
const client = new OffchainOpportunities({
  chainIds: [1],
  openingSignerRegistries: [
    {
      chainId: 1,
      marketConfigurator: cm,
      signers: accounts.map((a, i) => ({
        address: a.address,
        url: `https://signer${i}.example/sign`,
      })),
    },
  ],
});
const single = { ...req, authorizedSigners: [accounts[0].address] };
async function response(
  i: number,
  deadline: number = Math.floor(Date.now() / 1000) + 900,
): Promise<OpeningSignerResponse> {
  const message = {
    creditManager: cm,
    accountOwner: owner,
    deadline,
    nonce: 1,
  };
  const data = {
    domain: {
      chainId: 1,
      name: "SignatureDegenNFT",
      version: "3_10",
      verifyingContract: nft,
    },
    types: {
      Mint: [
        { name: "creditManager", type: "address" },
        { name: "accountOwner", type: "address" },
        { name: "deadline", type: "uint32" },
        { name: "nonce", type: "uint32" },
      ],
    },
    primaryType: "Mint",
    message,
  } as const;
  return {
    ...message,
    degenNFT: nft,
    signer: accounts[i].address,
    digest: hashTypedData(data),
    signature: await accounts[i].signTypedData(data),
  };
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
describe("opening signer", () => {
  it("retains the cause of network failures", async () => {
    const cause = new TypeError("connection closed");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(cause);
    const failure = expect(client.requestOpeningApproval(single)).rejects;
    await failure.toBeInstanceOf(OffchainRequestFailedError);
    await failure.toMatchObject({ url: "https://signer0.example/sign", cause });
  });
  it.each([
    ["invalid JSON", "not JSON", OffchainInvalidJsonError],
    ["invalid response fields", "{}", OffchainValidationError],
  ] as const)("classifies %s", async (_label, body, error) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(body));
    await expect(client.requestOpeningApproval(single)).rejects.toBeInstanceOf(
      error,
    );
  });

  it.each([60, 180, undefined])(
    "retries 503 after %s seconds or the fallback delay",
    async seconds => {
      vi.useFakeTimers();
      const ok = await response(0);
      const fetch = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response("Screening unavailable", {
            status: 503,
            headers: seconds ? { "Retry-After": String(seconds) } : {},
          }),
        )
        .mockResolvedValueOnce(Response.json(ok));
      const approval = client.requestOpeningApproval(single);
      await vi.advanceTimersByTimeAsync((seconds ?? 1) * 1000 - 1);
      expect(fetch).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      expect((await approval).signatures[0].signature).toBe(ok.signature);
      expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({
        chainId: 1,
        creditManager: cm,
        accountOwner: owner,
      });
    },
  );
  it.each([400, 422, 429, 451, 500])(
    "preserves terminal HTTP %s and its text",
    async status => {
      const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("diagnostic", {
          status,
          headers: { "Retry-After": "300" },
        }),
      );
      const failure = expect(client.requestOpeningApproval(single)).rejects;
      await failure.toBeInstanceOf(OffchainStatusError);
      await failure.toBeInstanceOf(OpeningSignerError);
      await failure.toMatchObject({
        url: "https://signer0.example/sign",
        status,
        details: "diagnostic",
        retryAfterSeconds: 300,
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );
  it("stops after the second unavailable response", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(
        async () => new Response("Chain unavailable", { status: 503 }),
      );
    const check = expect(
      client.requestOpeningApproval(single),
    ).rejects.toMatchObject({ status: 503 });
    await vi.advanceTimersByTimeAsync(1000);
    await check;
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it.each([true, false])(
    "collects a sorted quorum only for matching deadlines (%s)",
    async match => {
      const deadline = Math.floor(Date.now() / 1000) + 900;
      const r = await Promise.all([
        response(0, deadline),
        response(1, deadline + (match ? 0 : 1)),
      ]);
      vi.spyOn(globalThis, "fetch").mockImplementation(async url =>
        Response.json(r[String(url).includes("signer0") ? 0 : 1]),
      );
      const p = client.requestOpeningApproval({
        ...req,
        minSignaturesRequired: 2,
      });
      if (!match) {
        await expect(p).rejects.toBeInstanceOf(OpeningSignerQuorumError);
        return;
      }
      expect((await p).signatures.map(s => s.signature)).toEqual(
        r
          .sort((a, b) => (BigInt(a.signer) < BigInt(b.signer) ? -1 : 1))
          .map(x => x.signature),
      );
    },
  );
  it("rejects a response signed for another domain", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ ...(await response(0)), degenNFT: cm }),
    );
    await expect(client.requestOpeningApproval(single)).rejects.toBeInstanceOf(
      OpeningSignerVerificationError,
    );
  });
});

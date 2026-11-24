import {
  type Address,
  getAddress,
  type Hex,
  hashTypedData,
  isAddressEqual,
  recoverAddress,
} from "viem";
import type {
  OpeningApproval,
  OpeningSignature,
  OpeningSignerResponse,
  RequiredOpeningApproval,
} from "../../model/openingApproval.js";
import { openingSignerResponseSchema } from "../../model/openingApproval.schema.js";
import {
  OffchainValidationError,
  OpeningSignerConfigurationError,
  OpeningSignerError,
  OpeningSignerQuorumError,
  OpeningSignerVerificationError,
  readResponseBody,
} from "../errors/index.js";
import { fetchOffchainResponse, readOffchainJson } from "../transport.js";
import type { OpeningSignerRegistry } from "../types.js";
import { defaultOpeningSignerRegistries } from "./openingSignerRegistries.js";

const types = {
  Mint: [
    { name: "creditManager", type: "address" },
    { name: "accountOwner", type: "address" },
    { name: "deadline", type: "uint32" },
    { name: "nonce", type: "uint32" },
  ],
} as const;

function wait(ms: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

async function sign(
  url: string,
  expected: Address,
  req: RequiredOpeningApproval,
  signal: AbortSignal,
  timeout: number,
): Promise<OpeningSignerResponse> {
  const { chainId, creditManager, accountOwner } = req;
  for (let attempt = 0; ; attempt++) {
    const res = await fetchOffchainResponse(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chainId,
        creditManager: getAddress(creditManager),
        accountOwner: getAddress(accountOwner),
      }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(timeout)]),
    });
    if (!res.ok) {
      const raw = res.headers.get("retry-after");
      const seconds =
        raw !== null && /^\d+$/.test(raw) ? Number(raw) : undefined;
      const error = OpeningSignerError.fromStatus(
        url,
        res.status,
        await readResponseBody(res),
        seconds,
      );
      const delay = seconds ?? 1;
      if (res.status !== 503 || attempt === 1 || delay > 300) throw error;
      await wait(delay * 1000, signal);
      continue;
    }
    const parsed = openingSignerResponseSchema.safeParse(
      await readOffchainJson(url, res),
    );
    if (!parsed.success) throw new OffchainValidationError(url, parsed.error);
    await verifyResponse(url, parsed.data, expected, req);
    return parsed.data;
  }
}

async function verifyResponse(
  url: string,
  response: OpeningSignerResponse,
  expected: Address,
  req: RequiredOpeningApproval,
): Promise<void> {
  const { creditManager, accountOwner, chainId } = req;
  const message = {
    creditManager,
    accountOwner,
    nonce: response.nonce,
    deadline: response.deadline,
  };
  const digest = hashTypedData({
    domain: {
      name: "SignatureDegenNFT",
      version: "3_10",
      chainId,
      verifyingContract: req.degenNFT,
    },
    primaryType: "Mint",
    types,
    message,
  });
  if (
    !isAddressEqual(response.creditManager, creditManager) ||
    !isAddressEqual(response.accountOwner, accountOwner) ||
    !isAddressEqual(response.degenNFT, req.degenNFT) ||
    !isAddressEqual(response.signer, expected) ||
    response.nonce !== req.nonce ||
    response.deadline < Math.floor(Date.now() / 1000) ||
    digest !== response.digest.toLowerCase()
  )
    throw new OpeningSignerVerificationError(url, expected);
  let recovered: Address;
  try {
    recovered = await recoverAddress({
      hash: digest,
      signature: response.signature,
    });
  } catch (cause) {
    throw new OpeningSignerVerificationError(
      url,
      expected,
      cause instanceof Error ? cause : undefined,
    );
  }
  if (!isAddressEqual(recovered, expected))
    throw new OpeningSignerVerificationError(url, expected);
}

export async function collectOpeningApproval(
  req: RequiredOpeningApproval,
  registries: readonly OpeningSignerRegistry[] = defaultOpeningSignerRegistries,
  timeout: number = 30_000,
): Promise<OpeningApproval> {
  const eligible = new Map<Address, string>();
  for (const registry of registries) {
    if (
      registry.chainId !== req.chainId ||
      !isAddressEqual(registry.marketConfigurator, req.marketConfigurator)
    )
      continue;
    for (const signer of registry.signers) {
      if (req.authorizedSigners.some(a => isAddressEqual(a, signer.address)))
        eligible.set(getAddress(signer.address), signer.url);
    }
  }
  if (
    req.minSignaturesRequired < 1 ||
    eligible.size < req.minSignaturesRequired
  )
    throw new OpeningSignerConfigurationError(
      "Insufficient configured authorized opening signers",
    );
  const controller = new AbortController();
  const groups = new Map<Hex, Map<Address, OpeningSignature>>();
  try {
    // Each endpoint chooses its own deadline. Only identical digests form a quorum.
    return await new Promise<OpeningApproval>((resolve, reject) => {
      let pending = eligible.size;
      const failures: unknown[] = [];
      for (const [expected, url] of eligible) {
        sign(url, expected, req, controller.signal, timeout)
          .then(({ digest, signer, degenNFT: _degenNFT, ...entry }) => {
            const key = digest.toLowerCase() as Hex;
            const group =
              groups.get(key) ?? new Map<Address, OpeningSignature>();
            group.set(signer, entry);
            groups.set(key, group);
            if (group.size === req.minSignaturesRequired) {
              const signatures = [...group]
                .sort(([a], [b]) => (BigInt(a) < BigInt(b) ? -1 : 1))
                .map(([, e]) => e);
              resolve({
                chainId: req.chainId,
                degenNFT: req.degenNFT,
                signatures,
              });
            }
          })
          .catch(error => {
            failures.push(error);
          })
          .finally(() => {
            if (--pending === 0)
              reject(
                failures.length === 1 && eligible.size === 1
                  ? failures[0]
                  : new OpeningSignerQuorumError(
                      failures,
                      req.minSignaturesRequired,
                    ),
              );
          });
      }
    });
  } finally {
    controller.abort();
  }
}

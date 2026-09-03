// D1-S6 (precise-error-unions): no unclassified bare throws on public
// operation paths. Every audited site is either converted to a returned
// error code or kept as an invariant throw with a written disposition; this
// list drives the check, so a site cannot silently change class.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";
import type { StartDelayedWithdrawalOperation } from "../../onchain/accounts/intents/operations.js";
import { projectTail } from "../../onchain/accounts/intents/tail.js";
import { IntentPreviewError } from "../../onchain/validation/raise.js";

const ROOT = join(__dirname, "..", "..", "..");

interface Disposition {
  readonly file: string;
  /** A line the site must still contain, so the list tracks reality. */
  readonly anchor: string;
  readonly kind: "kept" | "converted";
}

/** The audited engine sites (trace of 2026-08-30) plus the prepare boundary. */
const ENGINE_SITES: readonly Disposition[] = [
  {
    file: "src/onchain/accounts/intents/index.ts",
    anchor: "not implemented",
    kind: "kept",
  },
  {
    file: "src/onchain/accounts/intents/index.ts",
    anchor: "startDelayedIntent: plan started no withdrawal",
    kind: "kept",
  },
  {
    file: "src/onchain/accounts/intents/index.ts",
    anchor: "startDelayedIntent: no request among the operations",
    kind: "kept",
  },
  {
    file: "src/onchain/accounts/intents/index.ts",
    anchor: "intentRoutes: a route neither answered nor refused",
    kind: "kept",
  },
  {
    file: "src/onchain/accounts/intents/tail.ts",
    anchor: "- not implemented",
    kind: "kept",
  },
  {
    file: "src/onchain/accounts/intents/tail.ts",
    anchor: "projectTail: the request queued nothing to claim",
    kind: "converted",
  },
] as const;

/** Boundary converters PrepareApi owns, each proven by its own test. */
const PREPARE_CODES = [
  "noStrategyTargetCollateral",
  "creditAccountNotFound",
  "unexpectedFailure",
] as const;

describe("throw sweep: engine", () => {
  it.each(ENGINE_SITES.map(site => [site.anchor, site] as const))(
    "engine site is dispositioned: %s",
    (_anchor, site) => {
      const source = readFileSync(join(ROOT, site.file), "utf8");
      const at = source.indexOf(site.anchor);
      expect(
        at,
        `${site.file} no longer contains "${site.anchor}"`,
      ).toBeGreaterThan(-1);
      const before = source.slice(Math.max(0, at - 600), at);
      expect(
        before,
        `${site.file} site "${site.anchor}" carries no disposition comment`,
      ).toContain(`disposition(D1-S6): ${site.kind}`);
      if (site.kind === "converted") {
        expect(before).toContain("IntentPreviewError");
      }
    },
  );

  it("engine: a claim whose request queued nothing refuses as noRecordedIntent", async () => {
    const request = {
      type: "startDelayedWithdrawal",
      outputs: [
        {
          token: "0x0000000000000000000000000000000000000001",
          amount: 1n,
          isDelayed: false,
        },
      ],
    } as unknown as StartDelayedWithdrawalOperation;
    await expect(
      projectTail({
        request,
        delayed: { claim: undefined } as never,
        creditAccount: {} as never,
        sdk: {} as never,
        quotaReserve: undefined,
      }),
    ).rejects.toSatisfy(error => {
      expect(error).toBeInstanceOf(IntentPreviewError);
      expect((error as IntentPreviewError).error.code).toBe("noRecordedIntent");
      return true;
    });
  });
});

describe("throw sweep: prepare boundary", () => {
  const api = readFileSync(join(ROOT, "src/sdk/prepare/PrepareApi.ts"), "utf8");
  const apiTest = readFileSync(
    join(ROOT, "src/sdk/prepare/PrepareApi.test.ts"),
    "utf8",
  );

  it.each(PREPARE_CODES)("boundary code %s is built and tested", code => {
    expect(api, `PrepareApi.ts no longer builds ${code}`).toContain(code);
    expect(apiTest, `PrepareApi.test.ts does not assert ${code}`).toContain(
      code,
    );
  });
});

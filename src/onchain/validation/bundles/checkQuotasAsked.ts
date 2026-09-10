import type { QuotaLimitReachedError, Token } from "../../../model/index.js";
import type { MarketSuite } from "../../market/MarketSuite.js";
import { checkQuotaLimit } from "../checks/index.js";
import type { CreditOperationPreview } from "./checkCreditOperation.js";

/** Every quota the operation raises, against the room the keeper has left. */
export function checkQuotasAsked(
  market: MarketSuite,
  preview: CreditOperationPreview,
  underlying: Token,
): QuotaLimitReachedError[] {
  const increases =
    preview.operation === "AdjustCreditAccount"
      ? preview.quotasChange
      : preview.quotas;

  const { pqk } = market.pool;

  return increases
    .filter(q => q.value > 0n)
    .flatMap(q => {
      // A token the market quotes nothing for has no ceiling to weigh against
      // and counts as no collateral — the same reading the engine's guard takes.
      const quoted = pqk.hasActiveQuota(q.token.address);
      return checkQuotaLimit({
        token: q.token,
        requested: quoted ? q.value : undefined,
        available: quoted ? pqk.quotaAvailable(q.token.address) : 0n,
        underlying,
      });
    });
}

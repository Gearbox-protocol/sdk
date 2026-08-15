import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chains } from "../../sdk/index.js";
import { OffchainOpportunities } from "./OffchainOpportunities.js";

/**
 * What the backend is asked for. The client covers a fixed set of chains and
 * the backend covers more of them — experimental ones included — so a request
 * that left the chains unsaid would answer for networks the caller never
 * configured.
 **/

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;

let fetchMock: MockInstance<typeof fetch>;

beforeEach(() => {
  fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ data: [], meta: { chains: [] } }), {
      headers: { "content-type": "application/json" },
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function opportunities(): OffchainOpportunities {
  return new OffchainOpportunities({
    baseUrl: "https://api.gearbox.fi",
    chainIds: [MAINNET, PLASMA],
  });
}

/**
 * Query the one request of a test was issued with.
 **/
function requested(): URLSearchParams {
  expect(fetchMock).toHaveBeenCalledOnce();
  return new URL(String(fetchMock.mock.calls[0]?.[0])).searchParams;
}

describe("every list request names the chains the client covers", () => {
  it("names all of them when the caller narrows nothing", async () => {
    await opportunities().list();

    expect(requested().get("chainIds")).toBe(`${MAINNET},${PLASMA}`);
  });

  it("narrows to the chains the filter names, alongside its other conditions", async () => {
    await opportunities().list({ chainIds: [PLASMA], kind: "pool" });

    const query = requested();
    expect(query.get("chainIds")).toBe(`${PLASMA}`);
    expect(query.get("kind")).toBe("pool");
  });

  it("drops a chain the client does not cover", async () => {
    // a filter narrows a read, it does not extend it
    await opportunities().list({ chainIds: [PLASMA, 424_242] });

    expect(requested().get("chainIds")).toBe(`${PLASMA}`);
  });
});

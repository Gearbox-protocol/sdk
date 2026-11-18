import { readFileSync } from "node:fs";
import type { Bundle } from "../bundles/Bundle.js";

/**
 * The catalog's mF-ONE strategy bundle as the catalog hands it out, frozen in
 * a fixture: the builder is tested against real catalog data without
 * depending on the catalog.
 **/
export function mfoneBundle(): Bundle {
  const { chainId: _, ...bundle } = JSON.parse(
    readFileSync(
      new URL("./fixtures/mfone-bundle.json", import.meta.url),
      "utf8",
    ),
  ) as Bundle & { chainId: number };
  return bundle;
}

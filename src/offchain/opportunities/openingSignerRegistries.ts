import type { OpeningSignerRegistry } from "../types.js";

/** Default endpoints for ACL-authorized opening signers, grouped by market configurator. */
export const defaultOpeningSignerRegistries: readonly OpeningSignerRegistry[] =
  [
    {
      chainId: 1,
      marketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
      signers: [
        {
          address: "0x25a116142fE62a9aCE9AeeF09AF1857de44DCd29",
          url: "https://signer.gear-dev.dev/sign",
        },
      ],
    },
  ];

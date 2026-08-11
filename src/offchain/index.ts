/**
 * Off-chain source of the read model: the client for the Gearbox backend.
 *
 * Exported as its own subpath so a consumer that only talks to the backend
 * does not pull in the on-chain SDK.
 **/
export * from "./GearboxAPI.js";
export * from "./opportunities/index.js";
export * from "./positions/index.js";
export * from "./types.js";

import { BaseError } from "viem";

export class ModeNotAvailableError extends BaseError {
  override name = "ModeNotAvailableError";
  readonly mode: "onchain" | "offchain";
  readonly entity?: string;

  constructor(mode: "onchain" | "offchain", entity?: string) {
    super(`mode ${mode} is not available`, {
      details: entity ? `on ${entity}` : undefined,
    });
    this.mode = mode;
    this.entity = entity;
  }
}

export class NotAttachedError extends BaseError {
  override name = "NotAttachedError";

  constructor() {
    super("SDK not attached");
  }
}

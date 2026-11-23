import { type Address, type Hex, isAddress } from "viem";
import { z } from "zod/v4";
import type { OpeningSignerResponse } from "./openingApproval.js";

const address = z.custom<Address>(v => typeof v === "string" && isAddress(v));
const uint32 = z.number().int().min(0).max(0xffffffff);
export const openingSignerResponseSchema = z.object({
  signer: address,
  degenNFT: address,
  digest: z.custom<Hex>(
    v => typeof v === "string" && /^0x[0-9a-f]{64}$/i.test(v),
  ),
  creditManager: address,
  accountOwner: address,
  deadline: uint32,
  nonce: uint32,
  signature: z.custom<Hex>(
    v => typeof v === "string" && /^0x[0-9a-f]{130}$/i.test(v),
  ),
}) satisfies z.ZodType<OpeningSignerResponse>;

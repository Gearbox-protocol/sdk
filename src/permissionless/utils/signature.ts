import { Hex } from "viem";

export function normalizeSignature(signature: Hex): Hex {
  // Remove '0x' prefix if present
  const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
  
  // Extract r, s, v components
  let v = parseInt(sig.slice(128, 130), 16);
  if (v === 0 || v === 1) {
      v += 27;
  }

  return `0x${sig.slice(0,128)}${v.toString(16)}`;
}
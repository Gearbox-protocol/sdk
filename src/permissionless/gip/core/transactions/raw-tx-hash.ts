import type { Hex } from "viem";
import { encodeAbiParameters, keccak256 } from "viem";
import type { RawTx } from "../../../../onchain/index.js";

export function getRawTxHash(tx: RawTx, eta: number): Hex {
  const data = `0x${tx.callData.slice(10)}` as Hex;
  return keccak256(
    encodeAbiParameters(
      [
        { name: "target", type: "address" },
        { name: "value", type: "uint256" },
        { name: "signature", type: "string" },
        { name: "data", type: "bytes" },
        { name: "eta", type: "uint256" },
      ],
      [tx.to, BigInt(tx.value), tx.signature, data, BigInt(eta)],
    ),
  );
}

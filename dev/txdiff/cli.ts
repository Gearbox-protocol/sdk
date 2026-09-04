/**
 * CLI for decoding and diffing Gearbox multicall transaction dumps.
 *
 * Usage:
 *   pnpm tx:decode <file.json|0xhex>
 *   pnpm tx:diff <a.json> <b.json>
 *
 * See `types.ts` for the shared TxDump JSON format.
 */

import { resolve } from "node:path";
import type { Address, Hex } from "viem";
import { decodeTx, formatDecodedTx } from "./decode.js";
import { diffTxDumps } from "./diff.js";
import { loadTxDump } from "./load.js";
import type { TxDumpTransaction } from "./types.js";

function usage(): never {
  console.error(`Usage:
  pnpm tx:decode <file.json|0xhex> [to=0x…]
  pnpm tx:diff <a.json> <b.json>`);
  process.exit(2);
}

function decodeCommand(args: string[]): void {
  const input = args[0];
  if (!input) {
    usage();
  }

  if (input.startsWith("0x")) {
    const toArg = args.find(a => a.startsWith("to="));
    const to = (toArg?.slice(3) ??
      "0x0000000000000000000000000000000000000000") as Address;
    const tx: TxDumpTransaction = {
      label: "calldata",
      to,
      data: input as Hex,
    };
    console.log(formatDecodedTx(decodeTx(tx)));
    return;
  }

  const path = resolve(input);
  const dump = loadTxDump(path);
  if (dump.description) {
    console.log(`# ${dump.description}`);
  }
  if (dump.chainId !== undefined) {
    console.log(`# chainId=${dump.chainId}`);
  }
  for (const tx of dump.transactions) {
    console.log(formatDecodedTx(decodeTx(tx)));
    console.log("");
  }
}

function diffCommand(args: string[]): void {
  const [a, b] = args;
  if (!a || !b) {
    usage();
  }
  const leftPath = resolve(a);
  const rightPath = resolve(b);
  const leftDump = loadTxDump(leftPath);
  const rightDump = loadTxDump(rightPath);

  console.log(
    `========== ${leftDump.description ?? leftPath} vs ${rightDump.description ?? rightPath} ==========`,
  );

  const leftTxs = leftDump.transactions.map(decodeTx);
  const rightTxs = rightDump.transactions.map(decodeTx);
  const { allMatch, output } = diffTxDumps(
    leftPath,
    leftTxs,
    rightPath,
    rightTxs,
  );
  console.log(output);
  if (!allMatch) {
    process.exit(1);
  }
}

function main(): void {
  // When invoked as `tsx dev/txdiff/cli.ts decode …`, argv[2] is the subcommand.
  // When invoked via `pnpm tx:decode …`, the package.json script already
  // appends `decode`, so argv[2] is still the subcommand.
  const [, , cmd, ...rest] = process.argv;
  if (cmd === "decode") {
    decodeCommand(rest);
  } else if (cmd === "diff") {
    diffCommand(rest);
  } else {
    // Allow `tsx dev/txdiff/cli.ts <file>` as shorthand for decode
    if (cmd && (cmd.endsWith(".json") || cmd.startsWith("0x"))) {
      decodeCommand([cmd, ...rest]);
      return;
    }
    usage();
  }
}

main();

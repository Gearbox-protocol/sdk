import type {
  ArgsDiff,
  CompositionMismatch,
  DecodedCall,
  DecodedTx,
  DiffResult,
} from "./types.js";

/**
 * Flattens a decoded call tree depth-first for composition comparison.
 * Top-level outer call is excluded — only the multicall body is compared.
 */
function flattenCalls(calls: DecodedCall[]): DecodedCall[] {
  const out: DecodedCall[] = [];
  for (const c of calls) {
    out.push(c);
    if (c.children?.length) {
      out.push(...flattenCalls(c.children));
    }
  }
  return out;
}

/**
 * Computes relative difference of two bigints in basis points.
 * Returns undefined when the base is zero.
 */
function bigintBpsDrift(a: bigint, b: bigint): bigint | undefined {
  if (a === b) {
    return 0n;
  }
  const base = a < 0n ? -a : a;
  if (base === 0n) {
    return undefined;
  }
  const diff = a > b ? a - b : b - a;
  return (diff * 10_000n) / base;
}

/**
 * Tries to extract a single differing bigint pair from two arg strings for
 * bps annotation. Returns undefined when args are not comparable that way.
 */
function tryBpsFromArgs(
  leftArgs: string,
  rightArgs: string,
): bigint | undefined {
  const numRe = /-?\d{5,}/g;
  const leftNums = leftArgs.match(numRe)?.map(BigInt) ?? [];
  const rightNums = rightArgs.match(numRe)?.map(BigInt) ?? [];
  if (leftNums.length === 0 || leftNums.length !== rightNums.length) {
    return undefined;
  }
  let max: bigint | undefined;
  for (let i = 0; i < leftNums.length; i++) {
    if (leftNums[i] === rightNums[i]) {
      continue;
    }
    const d = bigintBpsDrift(leftNums[i], rightNums[i]);
    if (d !== undefined && (max === undefined || d > max)) {
      max = d;
    }
  }
  return max;
}

/**
 * Compares two decoded transactions.
 *
 * Composition (order / target / functionName) mismatches fail the result.
 * Argument differences are reported for eyeballing and do not fail.
 */
export function diffDecodedTxs(left: DecodedTx, right: DecodedTx): DiffResult {
  const lines: string[] = [];
  const composition: CompositionMismatch[] = [];
  const args: ArgsDiff[] = [];

  if (left.to.toLowerCase() !== right.to.toLowerCase()) {
    composition.push({
      kind: "composition",
      index: -1,
      message: `tx target: left ${left.to}, right ${right.to}`,
    });
    lines.push(`  ✗ tx target: left ${left.to}, right ${right.to}`);
  }
  if (left.outer.functionName !== right.outer.functionName) {
    composition.push({
      kind: "composition",
      index: -1,
      message: `outer call: left ${left.outer.functionName}, right ${right.outer.functionName}`,
    });
    lines.push(
      `  ✗ outer call: left ${left.outer.functionName}, right ${right.outer.functionName}`,
    );
  }

  const leftCalls = flattenCalls(left.calls);
  const rightCalls = flattenCalls(right.calls);

  if (leftCalls.length !== rightCalls.length) {
    composition.push({
      kind: "composition",
      index: -1,
      message: `inner call count: left ${leftCalls.length}, right ${rightCalls.length}`,
    });
    lines.push(
      `  ✗ inner call count: left ${leftCalls.length}, right ${rightCalls.length}`,
    );
  }

  const len = Math.max(leftCalls.length, rightCalls.length);
  for (let i = 0; i < len; i++) {
    const l = leftCalls[i];
    const r = rightCalls[i];
    if (!l) {
      composition.push({
        kind: "composition",
        index: i,
        message: `extra in right: ${r.functionName} @ ${r.target}`,
      });
      lines.push(`  ✗ [${i}] extra in right: ${r.functionName} @ ${r.target}`);
      lines.push(`        args: ${r.args}`);
      continue;
    }
    if (!r) {
      composition.push({
        kind: "composition",
        index: i,
        message: `missing in right: ${l.functionName} @ ${l.target}`,
      });
      lines.push(
        `  ✗ [${i}] missing in right: ${l.functionName} @ ${l.target}`,
      );
      lines.push(`        args: ${l.args}`);
      continue;
    }

    const sameFn = l.functionName === r.functionName;
    const sameTarget = l.target.toLowerCase() === r.target.toLowerCase();
    if (!sameFn || !sameTarget) {
      composition.push({
        kind: "composition",
        index: i,
        message: `left ${l.functionName} @ ${l.target} vs right ${r.functionName} @ ${r.target}`,
      });
      lines.push(`  ✗ [${i}] left:  ${l.functionName} @ ${l.target}`);
      lines.push(`        args: ${l.args}`);
      lines.push(`        right: ${r.functionName} @ ${r.target}`);
      lines.push(`        args: ${r.args}`);
      continue;
    }

    lines.push(`  ✓ [${i}] ${l.functionName} @ ${l.target}`);
    if (l.args !== r.args) {
      const bpsDrift = tryBpsFromArgs(l.args, r.args);
      args.push({
        kind: "args",
        index: i,
        functionName: l.functionName,
        leftArgs: l.args,
        rightArgs: r.args,
        bpsDrift,
      });
      const bpsNote =
        bpsDrift !== undefined ? ` (max bigint drift ~${bpsDrift} bps)` : "";
      lines.push(`        left args:  ${l.args}`);
      lines.push(`        right args: ${r.args}${bpsNote}`);
    } else if (l.args) {
      lines.push(`        args: ${l.args}`);
    }
  }

  return {
    matches: composition.length === 0,
    composition,
    args,
    lines,
  };
}

/**
 * Diffs two TxDump files by pairing transactions on `label` (falling back to
 * index order when labels don't overlap).
 */
export function diffTxDumps(
  leftLabel: string,
  leftTxs: DecodedTx[],
  rightLabel: string,
  rightTxs: DecodedTx[],
): { allMatch: boolean; output: string } {
  const lines: string[] = [];
  let allMatch = true;

  const rightByLabel = new Map(rightTxs.map(t => [t.label, t]));
  const usedRight = new Set<string>();

  for (const l of leftTxs) {
    const r = rightByLabel.get(l.label);
    if (!r) {
      allMatch = false;
      lines.push(`\n--- ${l.label}: MISSING in ${rightLabel}`);
      continue;
    }
    usedRight.add(l.label);
    const result = diffDecodedTxs(l, r);
    allMatch &&= result.matches;
    lines.push(
      `\n--- ${l.label}: ${result.matches ? "MATCH" : "MISMATCH"} (outer: ${l.outer.functionName}, to: ${l.to})`,
    );
    lines.push(...result.lines);
  }

  for (const r of rightTxs) {
    if (!usedRight.has(r.label)) {
      allMatch = false;
      lines.push(`\n--- ${r.label}: EXTRA in ${rightLabel}`);
    }
  }

  lines.push(
    `\n${allMatch ? `All transactions match (${leftLabel} vs ${rightLabel}, call composition).` : `Some transactions deviate (${leftLabel} vs ${rightLabel}), see above.`}`,
  );

  return { allMatch, output: lines.join("\n") };
}

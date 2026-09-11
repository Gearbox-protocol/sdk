/**
 * Local-only catalog hook. No-ops unless sessionStart wrote a marker (cloud
 * agents skip sessionStart). Fail-open: any throw becomes {}.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  fingerprint,
  formatReport,
  loadCatalogFromFile,
  newHits,
  scanText,
  shouldSkipPath,
} from "./vocab-scan.mjs";

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const STATE_ROOT = join(tmpdir(), "gearbox-sdk-vocab");

export function isPlanPath(filePath) {
  if (!filePath) return false;
  const p = String(filePath).replace(/\\/g, "/");
  return (
    p.includes(".cursor/plans/") ||
    p.includes("/docs/plans/") ||
    p.endsWith(".plan.md")
  );
}

export function extractPlanFromTranscript(raw) {
  const found = [];
  const visit = node => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    const name = node.name ?? node.tool_name;
    if (typeof name === "string" && /createplan/i.test(name)) {
      const input = node.input ?? node.tool_input ?? {};
      const plan = input.plan ?? input.markdown ?? input.content;
      if (typeof plan === "string" && plan.length > 40) found.push(plan);
    }
    for (const value of Object.values(node)) visit(value);
  };

  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      visit(JSON.parse(trimmed));
    } catch {
      for (const line of trimmed.split("\n")) {
        const t = line.trim();
        if (!t.startsWith("{")) continue;
        try {
          visit(JSON.parse(t));
        } catch {
          /* skip bad line */
        }
      }
    }
  } else {
    for (const line of trimmed.split("\n")) {
      const t = line.trim();
      if (!t.startsWith("{")) continue;
      try {
        visit(JSON.parse(t));
      } catch {
        /* skip */
      }
    }
  }
  return found.at(-1) ?? "";
}

function projectDir(input) {
  return (
    process.env.CURSOR_PROJECT_DIR ||
    input.workspace_roots?.[0] ||
    process.cwd()
  );
}

function convId(input) {
  return input.conversation_id || input.session_id || "unknown";
}

function stateDir(input) {
  const proj = basename(projectDir(input)) || "sdk";
  return join(STATE_ROOT, proj, convId(input));
}

function emptyState() {
  return {
    journal: [],
    reported: [],
    planScanned: false,
    pendingContext: null,
    loggedPlanTool: false,
  };
}

function readState(dir) {
  const file = join(dir, "state.json");
  if (!existsSync(file)) return emptyState();
  try {
    return { ...emptyState(), ...JSON.parse(readFileSync(file, "utf8")) };
  } catch {
    return emptyState();
  }
}

function writeState(dir, state) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "state.json"), JSON.stringify(state));
}

function hasMarker(dir) {
  return existsSync(join(dir, "marker"));
}

function cleanupOld(root) {
  if (!existsSync(root)) return;
  const now = Date.now();
  const walk = dir => {
    let ents;
    try {
      ents = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of ents) {
      const p = join(dir, ent.name);
      if (!ent.isDirectory()) continue;
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      const children = readdirSync(p, { withFileTypes: true });
      const nested = children.some(c => c.isDirectory());
      if (nested) {
        walk(p);
        continue;
      }
      if (now - st.mtimeMs > MAX_AGE_MS) {
        rmSync(p, { recursive: true, force: true });
      }
    }
  };
  walk(root);
}

function catalogPath(input) {
  return join(projectDir(input), ".cursor/rules/banned-words.yaml");
}

function loadCatalogSafe(input) {
  const p = catalogPath(input);
  if (!existsSync(p)) return [];
  try {
    return loadCatalogFromFile(p);
  } catch {
    return [];
  }
}

function rememberHits(state, hits) {
  const seen = new Set(state.journal.map(fingerprint));
  for (const hit of hits) {
    const fp = fingerprint(hit);
    if (seen.has(fp)) continue;
    seen.add(fp);
    state.journal.push({
      key: hit.key,
      note: hit.note,
      path: hit.path,
      token: hit.token,
      piece: hit.piece,
      excerpt: hit.excerpt,
    });
  }
}

function unreported(state, hits) {
  const done = new Set(state.reported);
  return hits.filter(h => !done.has(fingerprint(h)));
}

function markReported(state, hits) {
  const done = new Set(state.reported);
  for (const hit of hits) done.add(fingerprint(hit));
  state.reported = [...done];
}

function queueContext(state, hits, cwd) {
  const fresh = unreported(state, hits);
  if (fresh.length === 0) return;
  markReported(state, fresh);
  state.planScanned = true;
  const report = formatReport(fresh, { cwd });
  state.pendingContext = state.pendingContext
    ? `${state.pendingContext}\n${report}`
    : report;
}

function drainContext(state) {
  const extra = state.pendingContext;
  state.pendingContext = null;
  return extra ? { additional_context: extra } : {};
}

function planTextFromToolInput(toolInput) {
  if (!toolInput || typeof toolInput !== "object") return "";
  for (const key of ["plan", "markdown", "content", "new_string", "contents"]) {
    const v = toolInput[key];
    if (typeof v === "string" && v.length > 40) return v;
  }
  return "";
}

function toolPath(toolInput) {
  if (!toolInput || typeof toolInput !== "object") return "";
  return (
    toolInput.path ||
    toolInput.file_path ||
    toolInput.filePath ||
    toolInput.target_notebook ||
    ""
  );
}

function stillPresent(hit, catalog) {
  if (!hit.path || hit.path.startsWith(":")) return false;
  if (!existsSync(hit.path)) return false;
  let text;
  try {
    text = readFileSync(hit.path, "utf8");
  } catch {
    return false;
  }
  return scanText(text, catalog, hit.path).some(
    h => fingerprint(h) === fingerprint(hit),
  );
}

export async function handleHook(input) {
  const event = input.hook_event_name;
  const dir = stateDir(input);

  if (event === "sessionStart") {
    cleanupOld(STATE_ROOT);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "marker"), `${Date.now()}\n`);
    writeState(dir, emptyState());
    return {};
  }

  if (event === "sessionEnd") {
    rmSync(dir, { recursive: true, force: true });
    return {};
  }

  if (!hasMarker(dir)) return {};

  const catalog = loadCatalogSafe(input);
  if (catalog.length === 0) return {};
  const state = readState(dir);
  const cwd = projectDir(input);

  if (event === "afterFileEdit") {
    const filePath = input.file_path || "";
    if (filePath && shouldSkipPath(filePath)) {
      writeState(dir, state);
      return {};
    }
    for (const edit of input.edits ?? []) {
      const added = newHits(
        edit.old_string ?? "",
        edit.new_string ?? "",
        catalog,
        filePath,
      );
      rememberHits(state, added);
    }
    if (isPlanPath(filePath)) {
      const text = (input.edits ?? []).map(e => e.new_string ?? "").join("\n");
      queueContext(state, scanText(text, catalog, filePath), cwd);
    }
    writeState(dir, state);
    const drained = drainContext(state);
    writeState(dir, state);
    return drained;
  }

  if (event === "postToolUse") {
    const toolName = String(input.tool_name ?? "");
    const toolInput = input.tool_input ?? {};
    if (/plan/i.test(toolName) && !state.loggedPlanTool) {
      process.stderr.write(`[vocab] plan-like tool_name=${toolName}\n`);
      state.loggedPlanTool = true;
    }

    if (/createplan/i.test(toolName)) {
      const text = planTextFromToolInput(toolInput);
      if (text) {
        queueContext(state, scanText(text, catalog, ":create-plan"), cwd);
      }
    } else if (/^(Write|StrReplace)$/i.test(toolName) || /write/i.test(toolName)) {
      const p = toolPath(toolInput);
      if (isPlanPath(p)) {
        const next = toolInput.new_string ?? toolInput.contents ?? "";
        const prev = toolInput.old_string ?? "";
        const hits =
          prev && next
            ? newHits(prev, next, catalog, p)
            : scanText(String(next), catalog, p);
        queueContext(state, hits, cwd);
      }
    }

    const out = drainContext(state);
    writeState(dir, state);
    return out;
  }

  if (event === "stop") {
    if (input.status && input.status !== "completed") {
      writeState(dir, state);
      return {};
    }

    if (!state.planScanned && input.transcript_path && existsSync(input.transcript_path)) {
      try {
        const plan = extractPlanFromTranscript(
          readFileSync(input.transcript_path, "utf8"),
        );
        if (plan) {
          queueContext(state, scanText(plan, catalog, ":transcript-plan"), cwd);
        }
      } catch {
        /* ignore */
      }
    }

    const live = state.journal.filter(h => stillPresent(h, catalog));
    const fresh = unreported(state, live);
    if (fresh.length) markReported(state, fresh);

    const planExtra = state.pendingContext;
    state.pendingContext = null;
    writeState(dir, state);

    const parts = [];
    if (planExtra) parts.push(planExtra);
    if (fresh.length) parts.push(formatReport(fresh, { cwd }));
    const followup = parts.join("\n").trim();
    return followup ? { followup_message: followup } : {};
  }

  return {};
}

async function main() {
  let input = {};
  try {
    const raw = readFileSync(0, "utf8");
    if (raw.trim()) input = JSON.parse(raw);
  } catch {
    process.stdout.write("{}\n");
    return;
  }
  let out = {};
  try {
    out = await handleHook(input);
  } catch {
    out = {};
  }
  process.stdout.write(`${JSON.stringify(out ?? {})}\n`);
}

try {
  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await main();
  }
} catch {
  process.stdout.write("{}\n");
}

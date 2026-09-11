import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { extractPlanFromTranscript, handleHook, isPlanPath } from "./vocab-gate.mjs";

describe("isPlanPath", () => {
  it("matches home, workspace, docs, and .plan.md", () => {
    assert.equal(
      isPlanPath("/Users/me/.cursor/plans/cheap_vocab_hooks.plan.md"),
      true,
    );
    assert.equal(isPlanPath("/repo/.cursor/plans/foo.md"), true);
    assert.equal(isPlanPath("/repo/docs/plans/open.md"), true);
    assert.equal(isPlanPath("/tmp/other.plan.md"), true);
    assert.equal(isPlanPath("/repo/src/foo.ts"), false);
  });
});

describe("extractPlanFromTranscript", () => {
  it("takes the last CreatePlan payload from jsonl", () => {
    const line = JSON.stringify({
      role: "assistant",
      message: {
        content: [
          {
            type: "tool_use",
            name: "CreatePlan",
            input: {
              name: "Cheap vocab hooks",
              plan: "# Cheap vocabulary gates\n\nDo not Read the yaml yourself.\n",
            },
          },
        ],
      },
    });
    const plan = extractPlanFromTranscript(`${line}\n`);
    assert.match(plan, /Cheap vocabulary gates/);
  });
});

describe("handleHook", () => {
  const workspace = process.cwd();
  const conversation_id = `vocab-test-${Date.now()}`;
  const dir = mkdtempSync(join(tmpdir(), "vocab-hit-"));
  const file_path = join(dir, "sample.ts");

  after(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("no-ops without a sessionStart marker", async () => {
    const out = await handleHook({
      hook_event_name: "stop",
      status: "completed",
      conversation_id: `${conversation_id}-cloud`,
      workspace_roots: [workspace],
    });
    assert.deepEqual(out, {});
  });

  it("journals new stems and followups once at stop", async () => {
    writeFileSync(file_path, "export const x = 1;\n");
    const base = {
      conversation_id,
      workspace_roots: [workspace],
    };
    await handleHook({ ...base, hook_event_name: "sessionStart" });

    const next = "export function checkDraw() {}\n";
    writeFileSync(file_path, next);
    const afterEdit = await handleHook({
      ...base,
      hook_event_name: "afterFileEdit",
      file_path,
      edits: [
        {
          old_string: "export const x = 1;\n",
          new_string: "export function checkDraw() {}\n",
        },
      ],
    });
    assert.equal(afterEdit.followup_message, undefined);

    const stop = await handleHook({
      ...base,
      hook_event_name: "stop",
      status: "completed",
    });
    assert.match(stop.followup_message ?? "", /draw/);

    const again = await handleHook({
      ...base,
      hook_event_name: "stop",
      status: "completed",
    });
    assert.equal(again.followup_message, undefined);

    await handleHook({ ...base, hook_event_name: "sessionEnd" });
  });

  it("injects CreatePlan payload on postToolUse", async () => {
    const id = `${conversation_id}-plan`;
    const base = { conversation_id: id, workspace_roots: [workspace] };
    await handleHook({ ...base, hook_event_name: "sessionStart" });
    const out = await handleHook({
      ...base,
      hook_event_name: "postToolUse",
      tool_name: "CreatePlan",
      tool_input: {
        name: "Example",
        plan: "# Plan\n\nThe operation checkDraw borrows from the pool.\n",
      },
    });
    assert.match(out.additional_context ?? "", /draw/);
    await handleHook({ ...base, hook_event_name: "sessionEnd" });
  });
});

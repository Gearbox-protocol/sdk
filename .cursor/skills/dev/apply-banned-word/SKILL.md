---
name: apply-banned-word
description: >-
  Apply replacements for one banned-words.yaml stem in a named path or glob.
  Use when the user @-mentions this skill with a key and a scope. Named-only;
  does not auto-load.
disable-model-invocation: true
---

# Scoped catalog sweep

Named-only. Load via `@apply-banned-word`. A sentence such as “finish leftover X
in validation” does **not** load this skill.

## Require key and scope

Refuse to run without both:

- `--key` / the stem
- a path, directory, or glob

Never default to the whole repo.

## Command

```bash
node .cursor/hooks/vocab-inventory.mjs --key <stem> <scope>
node .cursor/hooks/vocab-inventory.mjs --key <stem> --json <scope>
```

Do not Read `banned-words.yaml`. Use the **printed note** from inventory.

## Workflow

1. Run inventory on the given scope.
2. Classify each hit against that note: replace, keep, or confirm with the
   user. Contexts the note allows stay (`Math.ceil` / `ceilDiv` rounding,
   hash-prefixed data-source calls, and any other keep it lists).
3. Show a dry-run (file, piece, proposed identifier or wording). Wait for
   approval.
4. Edit only the approved files. Judge context in the agent; no `sed` and no
   jscodeshift.
5. Reply with remainders grouped by directory. That list is the handoff for a
   later `@apply-banned-word`. Do not add a tracking file.

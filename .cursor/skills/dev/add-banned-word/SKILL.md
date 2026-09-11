---
name: add-banned-word
description: >-
  Add a stem to .cursor/rules/banned-words.yaml after inventorying usages and
  drafting a note. Use when the user @-mentions this skill or wants to ban a
  word / add a catalog stem. Named-only; does not auto-load.
disable-model-invocation: true
---

# Add a catalog stem

Named-only. Load via `@add-banned-word`. Conversational phrasing does not load this skill.

This skill may edit `.cursor/rules/banned-words.yaml` because `banned-words.mdc`
names that exception. Prefer inventory output over dumping the catalog into chat.

**Do not sweep** existing code. If the user also wants a rename, tell them to
`@apply-banned-word` with an explicit glob.

## Command

```bash
node .cursor/hooks/vocab-inventory.mjs --key <stem> [paths...]
node .cursor/hooks/vocab-inventory.mjs --key <stem> --json [paths...]
```

Same matcher as the hook (`splitByCase`, longest `tokenLower.startsWith(key)`).
Do not use ripgrep. A key that is a prefix of a token is a hit; an inner
substring is not. Default file list is tracked plus non-ignored untracked files.

## Workflow

1. Normalize the stem (lowercase). If inventory **key overlap** shows this stem
   is only an inflection of an existing key, stop and refuse the second key.
2. Run inventory. Read the printed note (or `DEFAULT_NOTE` when absent),
   overlap, directory/piece counts, and hit excerpts.
3. Cluster hits by POS, identifier vs prose, and domain meaning.
4. Prefer replacements already in this repo, in this order:
   - `src/model/` public types and fields
   - contract/ABI identifiers (`src/abi/` and any other contract modules; none
     is special)
   - neighboring call-site names, only when those trees do not already name it
   Stay in this repo unless the user named another root. Intents are not a
   special vocabulary source.
5. **Stop** with: stem, key overlap, clusters, proposed yaml note, and
   “existing code stays unless you name a sweep scope and `@apply-banned-word`”.
   Do not write the yaml yet.
6. After the user confirms: append one yaml entry. Empty value only when there
   are no allowed contexts and no replacement. Otherwise follow the house
   style already in the yaml: forbidden use, allowed use, concrete
   replacement, false-positive keep.

## Note shape

```yaml
stem: |
  Ban as … only (…).
  … is fine (…).
  Prefer <existing identifier>.
  <false positive>; ignore.
```

---
name: openspec-record-fixes
description: Record post-apply fixes back into an OpenSpec change. Use after a change has been implemented and the user found issues that Claude fixed, to update tasks/design/proposal to reflect those fixes.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
---

Record post-apply fixes back into an OpenSpec change.

Use this **after** a change has been implemented (`/opsx:apply`) and the user found issues that you
fixed. The fixes are already done — this skill's job is to update the change's artifacts so they stay
an accurate record of all work: each fix becomes a task, and `design.md` / `proposal.md` are updated
when a fix changed a design decision or the scope.

**This skill records, it does not fix.** Assume the code fixes are already implemented in the
conversation. Never implement fixes here — only update OpenSpec artifacts.

**Input**: Optionally specify a change name and/or a description of the fixes. If omitted, infer the
change from conversation context and infer the fixes from what you just changed.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change or you just applied one
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and use the **AskUserQuestion
     tool** to let the user select

   Always announce: "Recording fixes into change: <name>" and how to override.

2. **Locate the artifacts**

   Resolve real file paths instead of assuming names:
   ```bash
   openspec instructions apply --change "<name>" --json
   ```
   Use the `contextFiles` map to find the artifact paths. For the `spec-driven` schema these are
   `proposal.md`, `design.md`, and `tasks.md` under `openspec/changes/<name>/`.

   Read all three artifacts before editing anything.

3. **Gather the list of fixes**

   Build the fix list from whatever is available:
   - Fixes you made in the current conversation (primary source)
   - `git diff` / `git log` of changes since the last task commit
   - An explicit description the user provided

   For each fix, capture:
   - A one-line summary of what was fixed
   - Which files changed
   - Whether it represents a **design-decision change** (→ `design.md`)
   - Whether it represents a **scope/behavior change** (→ `proposal.md`)

   **Pause if the fix list is empty or ambiguous** — ask the user to confirm what was fixed. Do not
   invent fixes.

4. **Append fix tasks to `tasks.md`**

   - Find the highest existing top-level section number `N` (e.g. sections `## 1.` … `## 7.`).
   - Create a `## (N+1). Post-Apply Fixes` section. If that section already exists from a prior run,
     reuse it and continue numbering its sub-tasks.
   - Add each fix as a completed task, since the fix is already done:
     ```
     - [x] (N+1).1 <fix summary>
     - [x] (N+1).2 <fix summary>
     ```

5. **Update `design.md` — only where a decision changed**

   For fixes flagged as design-decision changes, append a new numbered decision under `## Decisions`
   (or amend the affected existing decision) describing the corrected approach and **why** it
   changed. Leave `design.md` untouched for fixes that don't change a decision.

6. **Update `proposal.md` — only where scope/behavior changed**

   For fixes flagged as scope/behavior changes, add or adjust the relevant bullet under
   `## What Changes` (and `## Impact` if affected). Leave `proposal.md` untouched otherwise.

7. **Validate and summarize**

   ```bash
   openspec validate "<name>"
   ```
   Confirm the artifacts are still well-formed, then show the summary (below).

**Output On Success**

```
## Fixes Recorded

**Change:** <change-name>
**Fixes recorded:** <count>

### tasks.md
Added section "## (N+1). Post-Apply Fixes":
- [x] (N+1).1 <fix summary>
- [x] (N+1).2 <fix summary>

### design.md
- updated (decision <k>: <short title>)   — or — unchanged (no design-decision change)

### proposal.md
- updated (What Changes: <bullet>)         — or — unchanged (no scope change)

✓ openspec validate passed
```

**Output On Pause (fixes unclear)**

```
## Paused — Need Confirmation

**Change:** <change-name>

I couldn't determine the set of fixes to record. Please confirm what was fixed, for example:
- <candidate fix 1 inferred from the diff>
- <candidate fix 2 inferred from the diff>

Which of these should I record, and are there others?
```

**Guardrails**
- Record only — never implement fixes in this skill; assume they're already done.
- Resolve artifact paths from CLI output (`contextFiles`); don't hardcode file names.
- Always read all three artifacts before editing.
- New fix tasks go in a dedicated `Post-Apply Fixes` section, marked `[x]`.
- Touch `design.md` / `proposal.md` only when the fix genuinely changes a decision or scope;
  otherwise note the deliberate no-op in the summary.
- Run `openspec validate` before declaring done.
- Pause and ask if the set of fixes is ambiguous — don't invent fixes.

**Fluid Workflow Integration**

This skill fits between apply and archive in the "actions on a change" model:

- **propose** (`/opsx:propose`) → **apply** (`/opsx:apply`) → **record-fixes** (this skill) →
  **archive** (`/opsx:archive`)
- Can be invoked repeatedly as more issues surface — each run appends to the same
  `Post-Apply Fixes` section.
- Keeps the change artifacts accurate so the archive-time spec sync reflects all real work.

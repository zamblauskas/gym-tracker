---
description: Post-Implementation Consistency Audit
---

# Role: Project Consistency Auditor

Your goal is to ensure that all local unstaged changes perfectly mirror the existing architectural patterns and code style. You must be exhaustive. The goal is to make sure all files in this project look like they were created by a single engineer. Be on the cautious side, if you can't find a Match, raise it as Diverged. Be extra vigilant, point even the smallest inconsistencies.
Avoid using terminal while performing the task.

## Phase 1: Inventory Creation

1.  **Generate Inventory:** Run `python3 .agent/scripts/diff-for-audit.py` to find what was changed.

## Phase 2: The Exhaustive Deep-Dive

For **EACH** file in the inventory:

1.  **Find Twins:** Identify the most similar existing files ("Twins") in the codebase to serve as the reference.
2.  **Evidence-Based Analysis:** meaningfuly compare the pattern, style, and logic. You must specify which files, classes, methods or variable match or diverge. You must evaluate if the change was done by the same engineer as all the other files in this project.
3.  **Record Decision:** Append your analysis for this specific file to the audit file in the following format:

    ```markdown
    ### File: [Filename]

    - **Twin:** [Reference File]
    - **Status:** [✅ Match / ⚠️ Diverged]
    - **Evidence:** [Quote specific lines or patterns that match/diverge]
    - **Rationale:** [Why is this a match or a break?]
    ```

4.  Write full audit to consistency-audit-{timestamp}.md

## Phase 3: The Final Report

Once **ALL** files in the inventory have been analyzed, output the final report to the user (in the chat):

### 🔍 Pattern Mapping Summary

| Component | Twins Used           | Status |
| :-------- | :------------------- | :----- |
| [File 1]  | [Twin 1.1, Twin 1.2] | ✅     |
| [File 2]  | [Twin 2.1, Twin 2.2] | ⚠️     |

### 🚩 deviations & Issues

_Summarize any `⚠️ Diverged` items here._

## Phase 4: Final Verdict

**[APPROVED - NATIVE]**: All files matched their twins.
**[REJECT - INCONSISTENT]**: One or more files introduced structural debt.

_If rejected, provide the exact code blocks needed to fix the divergence._

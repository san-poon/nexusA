# Ownership, Reputation and Compensation Mechanism

**1. Ownership Percentage**

The core idea is to track how much of a block's current state can be attributed to each contributor over time, snapshot by snapshot.

*   **Tracking:** Storing ownership percentages `{ contributorId: percentage }` for each block within each approved content snapshot is the right approach. This necessitates a version history for blocks.
*   **Heuristics:**
    *   **1. Add:** 100% to the creator. Simple, clear.
    *   **2. Delete:** 100% loss for all previous contributors. The contribution no longer exists in the current snapshot. Makes sense.
    *   **4. Split (Block A -> B, C):** Treat A as deleted (heuristic 2 applies). Create B and C, initially inheriting A's ownership distribution *from the snapshot just before deletion*. If the contributor performing the split *also edits* B or C immediately, apply heuristic 3 to the newly created B or C relative to their inherited state.
    *   **5. Merge (Blocks A, B -> C):** Treat A and B as deleted (heuristic 2 applies). Create C. Calculate the initial ownership of C based on the *Content Value* (CV - see next section) of A and B from the snapshot just before deletion. For a contributor `k`:
        `Initial Own_C(k) = (Own_A(k) * CV_A + Own_B(k) * CV_B) / (CV_A + CV_B)`
        (Normalize percentages to sum to 100%). If the contributor performing the merge *also edits* C immediately, apply heuristic 3 to the newly created C relative to this merged state.
    *   **3. Edit (Modify Block A -> A'):** This is indeed the trickiest. Using a diff is the way to go.
        *   **Diff Calculation:** Use a character-level diff algorithm (like `diff-match-patch`) to compare the content of A (before edit) and A' (after edit). Calculate:
            *   `CharsAdded`
            *   `CharsDeleted`
            *   `CharsUnchanged`
            *   `OriginalSize = CharsDeleted + CharsUnchanged`
            *   `DiffSize = CharsAdded + CharsDeleted`
        *   **Change Factor (CF):** `CF = DiffSize / OriginalSize` (Handle `OriginalSize = 0` case - covered by Add heuristic). This measures the edit magnitude relative to the original. We might cap CF at, say, 2 (representing a near-total rewrite + significant addition).
        *   **Ownership Adjustment Parameter (Alpha):** Introduce a tuning parameter `Alpha` (e.g., `0.7`). This determines how much ownership shifts with edits. `Alpha=1` means a 100% rewrite gives 100% ownership to the editor. `Alpha=0.5` means it gives 50%.
        *   **Ownership Calculation:**
            1.  Calculate the editor's gained share: `GainedShare = min(Alpha * CF, 1.0)` (capped at 100%).
            2.  Calculate the share retained collectively by previous owners: `RetainedShare = 1.0 - GainedShare`.
            3.  For each previous owner `k` with `Own_Old(k)`: their new temporary share is `Own_Temp(k) = Own_Old(k) * RetainedShare`.
            4.  The editor `e`: their new temporary share is `Own_Temp(e) = GainedShare + (Own_Old(e) * RetainedShare)` (they gain the `GainedShare` and also retain a portion of any ownership they *already* had).
            5.  **Normalize:** Sum all `Own_Temp` values (`TotalTempShare`). The final ownership for any contributor `j` is `Own_New(j) = Own_Temp(j) / TotalTempShare`.
        *   **Threshold:** Consider applying ownership changes only if `CF` exceeds a small threshold (e.g., 0.05) to ignore trivial typo fixes.

**2. Base Weight / Content Value (CV)**

Let's call it "Content Value" (CV). It represents the inherent substance or effort associated with a block, independent of user votes.

*   **Purpose:** Used for weighting in merge ownership calculation, potentially reputation and compensation. It's recalculated when a block's content/type changes in a new snapshot.
*   **Trackable Block Types:** From `defaultEditorNodes.ts`, the key *trackable* block-level nodes seem to be:
    *   `HeadingNode`
    *   `QuoteNode`
    *   `ListNode` (or maybe `ListItemNode` individually?) - Let's track `ListItemNode`.
    *   `CodeNode`
    *   `ImageNode`
    *   `EquationNode`
    *   `CollapsibleContainerNode` (value includes its contents)
    *   `MCQContainerNode` (value includes its contents)
    *   `TableNode` (value includes its contents)
    *   `ParagraphNode` (Lexical's default block)
    *   `HorizontalRuleNode` (Minimal CV)
*   **Calculation Formula:** `CV = TypeMultiplier * VolumeMetric`
    *   **Type Multipliers (Examples - needs tuning):**
        *   `ParagraphNode`, `QuoteNode`, `ListItemNode`: 1.0
        *   `HeadingNode`: 1.2 (Structure)
        *   `CodeNode`: 3.0 (Complexity)
        *   `EquationNode`: 5.0 (Specialized)
        *   `ImageNode`: 10.0 (Creation/Upload effort - Make this higher)
        *   `MCQContainerNode`, `CollapsibleContainerNode`, `TableNode`: 0.5 (Container overhead) + Sum of CV of children.
        *   `HorizontalRuleNode`: 0.1 (Minimal)
    *   **Volume Metric:**
        *   Text-based (Paragraph, Heading, Quote, List Item, Code): Character count.
        *   `EquationNode`: Character count of the underlying LaTeX/MathML source.
        *   `ImageNode`: Fixed value of 1 (Multiplier handles the value). Alternatively, could use image dimensions, but fixed is simpler.
        *   Containers: Sum of child CVs.
*   **Example:** A `CodeNode` with 150 chars: `CV = 3.0 * 150 = 450`. An `ImageNode`: `CV = 10.0 * 1 = 10`. (Adjust multipliers as needed).

**3. Reputation**

*   **Block Reputation (Rep_Block):**
    *   Based *only* on direct upvotes/downvotes on the block itself.
    *   Use the **Wilson Score Interval lower bound** for the probability of a positive rating. It's statistically sound, especially with few votes. `Rep_Block = WilsonScore(Upvotes, TotalVotes)`. This yields a score between 0 and 1.
    *   **Whole Content Likes:** Do *not* distribute page/section likes to individual blocks. Keep block reputation focused on granular feedback. Page-level likes can contribute to a separate *course* or *section* reputation.
*   **Contributor Reputation (Rep_Contributor):**
    *   An aggregation of the value and quality of their contributions.
    *   `Rep_Contributor = Sum_over_all_blocks( Own_Block(Contributor) * Rep_Block * CV_Block )`
    *   This formula weights contributions by ownership share, block quality (votes), and block substance (CV).

**4. Compensation**

*   **Tracking:**
    *   Client-side analytics needed. Using `IntersectionObserver` to track which blocks are *visible* in the viewport is feasible.
    *   Record `(paidUserId, blockId, visibleDuration)` periodically. Sum durations per block per user session.
*   **Value Calculation:**
    *   Assume total value generated by a paid user session `s` is `TotalValue_s` (e.g., proportional to subscription fee fraction or total time).
    *   Total weighted view time for user `s`: `TotalWeightedTime_s = Sum_over_blocks_i ( visibleDuration_s(i) * CV_Block_i )`. This weights time spent by the content value of the block being viewed.
    *   Value generated per unit of weighted view time for user `s`: `ValuePerUnitTime_s = TotalValue_s / TotalWeightedTime_s`.
*   **Block Compensation:**
    *   Value attributed to viewing block `i` during session `s`: `Value_Block_i_s = visibleDuration_s(i) * CV_Block_i * ValuePerUnitTime_s`.
*   **Contributor Compensation:**
    *   Compensation for contributor `k` from block `i` during session `s`: `Comp_k_i_s = Value_Block_i_s * Own_Block_i(k)`.
    *   Total compensation for contributor `k`: `Sum_over_s ( Sum_over_i ( Comp_k_i_s ) )`.
*   **Disqualification:**
    *   If paid user `s` dislikes or flags block `i`, set `Value_Block_i_s = 0` for that block *in that specific user's calculation*. This prevents the contributor from earning from that specific negative interaction.
    *   **No Negative Deduction:** Avoid deducting earnings. Disqualification is sufficient. Flags/dislikes primarily feed into the `Rep_Block` calculation (affecting future reputation) and alert moderation teams. Chronic low reputation or flags can lead to content review/removal, naturally stopping compensation.

**Key Implementation Notes:**

*   **Block IDs:** Each trackable block needs a persistent unique ID across snapshots. Lexical node keys (`node.getKey()`) might work if managed carefully, or you might need to introduce your own UUIDs.
*   **Database:** You'll need tables for snapshots, blocks, block metadata (CV, votes), ownership history per snapshot, user votes, and potentially aggregated compensation logs. The `Ownership` table could become large; consider optimizations if needed.
*   **Atomicity:** Ensure that snapshot approval, CV recalculation, and ownership updates happen atomically.

This framework provides a detailed starting point. You'll need to refine the multipliers (`Alpha`, CV Type Multipliers), thresholds, and potentially the compensation value calculation based on your specific platform economics and user behavior.

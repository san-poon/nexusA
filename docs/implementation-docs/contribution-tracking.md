**Project Context:**

We are building a collaborative course content creation platform using Next.js 15 (with React 19) as a full-stack framework, Supabase for the database and authentication, DrizzleORM for database interaction, shadcn-ui for minimalist UI components, and the Lexical framework for the rich text editor.

The core goal is to implement a robust system to track block-level contributions (paragraphs, images, quizzes, etc.) within the Lexical editor state. This system must fairly recognize contributor efforts, assess the value of contributions, and translate this into measurable reputation scores. This tracking will be used for versioning, calculating contributor ownership percentages, reputation scores, and potential compensation, while also preventing system gaming. An admin/trusted-user approval workflow will gate contributions.

**Tech Stack:** Next.js App Router (v15+), Lexical.js, React (v19+), TailwindCSS (v4+), Shadcn UI, Supabase (Auth, DB, Functions), DrizzleORM. Favor Server Components and Server Actions.

## Phase 1: Foundational Data Model, Persistent IDs & Basic Submission

**Goal:** Establish the core database schema, integrate persistent unique identifiers into Lexical nodes, and create a basic API endpoint to capture raw contribution submissions.

**Design Context:**

*   **Database (Supabase/Postgres with DrizzleORM):** Design the schema with robustness and best practices. Prioritize normalization, clear relationships, constraints (NOT NULL, foreign keys), efficient indexing (on IDs, FKs, `blockId`), and UUIDs for primary keys. Use DrizzleORM for schema definition (`schema.ts`) and Drizzle Kit for migrations.
*   **Lexical Block Identification:** Implement persistent UUIDs (`blockId`) within each relevant Lexical node's data to ensure unique identification across sessions, saves, and versions. Lexical's internal `key` is insufficient.
*   **Security:** Initial focus is on reliable generation and storage. Client-side `blockId` tampering prevention will be addressed later.

**Phase 1 Implementation Requirements:**

1.  **Database Schema Definition (DrizzleORM in `schema.ts`):**
    This section provides the consolidated schema definition. Use DrizzleORM for schema definition and Drizzle Kit (`pnpm drizzle-kit:generate`) for generating SQL migrations.

    **Enum Types (Define these using `pgEnum` in Drizzle):**
    *   `block_type_enum`: 'paragraph', 'heading', 'list', 'list_item', 'quote', 'code', 'image', 'mcq', 'collapsible', 'equation', 'table', 'horizontal_rule', /* Add other custom block types */
    *   `block_status_enum`: 'active', 'archived', 'flagged_for_review', 'deleted' // Note: 'deleted' used for anti-gaming check
    *   `feedback_type_enum`: 'LIKE', 'DISLIKE', 'FLAG'
    *   `flag_reason_enum`: 'INACCURATE', 'OUTDATED', 'UNCLEAR', 'BROKEN_INTERACTIVITY', 'COPYRIGHT_VIOLATION', 'SPAM', 'OTHER'
    *   `flag_status_enum`: 'OPEN', 'UNDER_REVIEW', 'RESOLVED_ACCEPTED', 'RESOLVED_REJECTED', 'RESOLVED_DUPLICATE'
    *   `history_event_enum`: 'CREATE', 'MAJOR_EDIT', 'MINOR_EDIT', 'DELETE', 'RESTORE', 'STATUS_CHANGE', 'OWNERSHIP_TRANSFER'
    *   `submission_status_enum`: 'pending', 'approved', 'rejected'
    *   `content_version_status_enum`: 'draft', 'approved', 'archived' // Added for contentVersions

    **Tables:**

    *   **`profiles`**: User profile extensions.
        *   `userId` (UUID, PK): References `auth.users.id`.
        *   `contributorReputationScore` (Numeric, Default: 0, Not Null).
        *   `canApprove` (Boolean, Default: false, Not Null): Permission flag for approval workflow.
        *   `createdAt` (Timestamp, Default: `now()`, Not Null).
        *   `updatedAt` (Timestamp, Default: `now()`, On Update: `now()`).

    *   **`blocks`**: Represents the persistent identity and *latest approved state* of a logical content block.
        *   *Note:* This table is partially denormalized to store latest calculated values and metadata for efficient read access.
        *   `blockId` (UUID, PK): Persistent ID generated in Lexical nodes.
        *   `courseId` (UUID, Not Null): FK to `courses.id` (Assuming `courses` table exists).
        *   `originalCreatorId` (UUID, Not Null): FK to `users.id`.
        *   `creationTimestamp` (Timestamp, Default: `now()`, Not Null).
        *   `blockType` (`block_type_enum`, Not Null): *Latest known* type of the block.
        *   `status` (`block_status_enum`, Default: 'active', Not Null).
        *   `contentUnitId` (UUID): FK to `tocItems.id` (or similar). *Latest known* location (associated with the most recent approved `block_versions` record).
        *   `lastModifierId` (UUID): FK to `users.id`.
        *   `lastModifiedTimestamp` (Timestamp).
        *   `blockWeight` (Numeric, Not Null): Latest calculated weight based on `blockType`.
        *   `blockContentValue` (Numeric, Default: 0, Not Null): Latest calculated value based on content complexity.
        *   `blockValue` (Numeric, Default: 0, Not Null): Latest calculated `blockWeight * (1 + blockContentValue)`.
        *   `deletedAt` (Timestamp, Nullable): Timestamp when `status` changed to 'deleted'.
        *   `lastKnownContentHash` (Text, Nullable): Content signature stored upon deletion for anti-gaming checks.

    *   **`block_versions`**: Immutable snapshots of a block's state as it existed within a specific `contentVersion`.
        *   `id` (UUID, PK): Unique ID for this specific version snapshot.
        *   `blockId` (UUID, Not Null): FK to `blocks.blockId`.
        *   `contentVersionId` (UUID, Not Null): FK to `contentVersions.id`.
        *   `tocItemId` (UUID, Not Null): FK to `tocItems.id`. Location of the block *in this content version*.
        *   `blockType` (`block_type_enum`, Not Null): Type of the block *in this content version*.
        *   `blockValueSnapshot` (Numeric, Not Null): The calculated `blockValue` *for this version*.
        *   `blockReputationScoreSnapshot` (Numeric, Default: 50, Not Null): The calculated reputation score (0-100) *for this version*.
        *   `ownershipSnapshot` (JSONB, Not Null): Ownership map (`{userId: percentage}`) *for this version*.
        *   `viewCount` (Integer, Default: 0, Not Null): View count specific *to this version*.
        *   `createdAt` (Timestamp, Default: `now()`, Not Null): Timestamp when this version was approved/created.
        *   **Constraints:** `UNIQUE(blockId, contentVersionId)`.

    *   **`ownership`**: Tracks contributor ownership percentages for a specific `block_versions` record.
        *   `blockVersionId` (UUID, Not Null): FK to `block_versions.id` ON DELETE CASCADE.
        *   `userId` (UUID, Not Null): FK to `users.id`.
        *   `percentage` (Numeric(5, 2), Not Null): Ownership share (CHECK >= 0 AND <= 100).
        *   `updatedAt` (Timestamp, Default: `now()`).
        *   **Constraints:** `PRIMARY KEY(blockVersionId, userId)`.

    *   **`feedback`**: User feedback submitted for a specific `block_versions` record.
        *   `feedbackId` (UUID, PK).
        *   `blockVersionId` (UUID, Not Null): FK to `block_versions.id` ON DELETE CASCADE.
        *   `userId` (UUID, Not Null): FK to `users.id` (user providing feedback).
        *   `feedbackType` (`feedback_type_enum`, Not Null).
        *   `flagReason` (`flag_reason_enum`, Nullable): Required if `feedbackType` is 'FLAG'.
        *   `flagComment` (Text, Nullable).
        *   `flagStatus` (`flag_status_enum`, Default: 'OPEN', Not Null).
        *   `resolverId` (UUID, Nullable): FK to `users.id` (user who resolved flag).
        *   `resolvedAt` (Timestamp, Nullable).
        *   `comment` (Text, Nullable): General comment (e.g., for dislikes).
        *   `createdAt` (Timestamp, Default: `now()`, Not Null).

    *   **`contributionHistory`**: Audit log of significant events related to a logical block.
        *   `id` (UUID, PK).
        *   `blockId` (UUID, Not Null): FK to `blocks.blockId`.
        *   `userId` (UUID, Not Null): FK to `users.id` (user performing action).
        *   `event` (`history_event_enum`, Not Null).
        *   `details` (JSONB, Nullable): Event-specific context (e.g., previous status, involved `blockVersionId`).
        *   `timestamp` (Timestamp, Default: `now()`, Not Null).

    *   **`pendingSubmissions`**: Temporary storage for content submissions awaiting review.
        *   `id` (UUID, PK).
        *   `userId` (UUID, Not Null): FK to `users.id` (submitter).
        *   `tocItemId` (UUID, Not Null): FK to `tocItems.id` (target location).
        *   `lexicalStateJson` (JSONB, Not Null): Raw submitted editor state.
        *   `status` (`submission_status_enum`, Default: 'pending', Not Null).
        *   `isPotentialRecreation` (Boolean, Default: false, Not Null): Anti-gaming flag.
        *   `potentialOriginalBlockId` (UUID, Nullable): FK to `blocks.blockId` (matched deleted block).
        *   `createdAt` (Timestamp, Default: `now()`, Not Null).

    **Relationships Summary:**
    *   `blocks` (1) <-> (*) `block_versions` (Many: represents history/snapshots)
    *   `block_versions` (1) <-> (*) `ownership` (Many: represents ownership distribution *for that version*)
    *   `block_versions` (1) <-> (*) `feedback` (Many: represents feedback *for that version*)
    *   `blocks` (1) <-> (*) `contributionHistory` (Many: audit trail for the logical block)
    *   Other FKs link to external tables like `auth.users`, `courses`, `contentVersions`, `tocItems`.

    **Indexing Strategy:**
    *   Include Primary Keys (PK) on all `id` / `blockId` / composite keys.
    *   Include Foreign Key (FK) indexes on all FK columns for efficient joins (e.g., `block_versions.blockId`, `block_versions.contentVersionId`, `ownership.userId`, `feedback.blockVersionId`, `feedback.userId`, `pendingSubmissions.userId`, etc.).
    *   Index columns frequently used in `WHERE` clauses:
        *   `blocks.status`, `blocks.blockType`, `blocks.deletedAt`, `blocks.lastKnownContentHash`
        *   `feedback.feedbackType`, `feedback.flagStatus`
        *   `pendingSubmissions.status`, `pendingSubmissions.tocItemId`
    *   Consider multi-column indexes where appropriate (e.g., `blocks(status, deletedAt)` for anti-gaming query).

    *Ensure all timestamp fields handle defaults (`now()`) and updates (`ON UPDATE`) correctly based on specific column requirements.*

2.  **Lexical Editor Integration (Persistent Block IDs):**
    *   **Approach:** Hybrid model for robustness.
        *   **Core Lexical Nodes (e.g., `ParagraphNode`, `HeadingNode`):** Use Lexical's Node Replacement/Override mechanism. Create custom subclasses (e.g., `TrackedParagraphNode extends ParagraphNode`). Add `__blockId: string` initialized with UUID v4. Override `clone`, `exportJSON`, static `importJSON` to persist `__blockId` (exported as `blockId`). Register replacements in editor config.
        *   **Project Custom Nodes (e.g., `ImageNode`, `MCQContainerNode`, `EquationNode`):** Modify existing custom node classes directly. Add `__blockId: string` property. Update `constructor` (accept optional `blockId`, default to new UUID), static `clone` (pass `__blockId`), static `importJSON` (read `blockId`, pass to constructor), `exportJSON` (include `blockId`), and `$create...Node` factory functions (accept optional `blockId`).
    *   **Universally:** The `blockId` (exposed as `blockId` in JSON) MUST be a UUID v4 and persist across all operations (save, load, copy, paste, edit) for all tracked block-level nodes. It corresponds to `blocks.blockId`.
    *   **Verification:** Test creating/editing various blocks, saving/loading editor state JSON, and ensuring `blockId` is present and persistent on all relevant nodes.

3.  **Basic Submission API Endpoint:**
    *   Create `app/api/contributions/submit/route.ts` (Next.js **Route Handler**).
    *   **Input:** POST request with JSON body: `{ tocItemId: string, lexicalStateJson: object }`.
    *   **Authentication:** Use Supabase server-side helpers to get authenticated `userId`. Reject if unauthorized.
    *   **Action:** Insert a new record into `pendingSubmissions` table with `userId`, `tocItemId`, and `lexicalStateJson`.
    *   **Response:** Return success (e.g., 201 Created) or error.
    *   **Note:** No diffing, ownership calculation, or approval logic yet. This endpoint only captures the raw submission.

## Phase 2: Core Contribution Engine (Diffing, Ownership, Value Calc)

**Goal:** Implement the backend services for processing contributions, including change detection, anti-gaming checks, ownership calculation, and block value assessment.

**Prerequisites:** Phase 1 complete.

**Design Context:**

*   **Modularity:** Encapsulate diffing and ownership logic in reusable functions/services (e.g., `src/lib/diffingService.ts`, `src/lib/ownershipService.ts`).
*   **Configuration:** Store ownership parameters (`min_impact_threshold`, `modifier_share_factor`, `max_transfer_cap`) and other constants centrally (e.g., `src/config/contributionConfig.ts`).
*   **Database:** Use DrizzleORM client. Wrap multi-step updates (ownership, block versions, block updates) in Drizzle transactions (`db.transaction(...)`).
*   **Error Handling:** Implement robust error handling within services (e.g., handling DB errors, calculation issues) and propagate appropriately.

**Phase 2 Implementation Requirements:**

1.  **Pre-Approval Processing (Robust Delete/Recreate Check):**
    *   **Goal:** Detect if a newly submitted block is highly similar to a recently deleted block to flag potential ownership gaming.
    *   **Location:** Enhance submission handling logic. This check should ideally run *after* submission but *before* the item appears in the default approval queue. It could be an asynchronous background job triggered on submission or a synchronous step if performant enough.
    *   **Process:** For each block marked as *newly created* within the submitted `lexicalStateJson`:
        1.  **Calculate Signature:** Generate a content signature/hash for the new block. (See "Content Hashing/Similarity" below).
        2.  **Query Candidate Deleted Blocks:** Query the `blocks` table for potential matches:
             *   `WHERE status = 'deleted'`
             *   `AND deletedAt >= now() - interval '[ConfigurableRecentWindow]'` (e.g., 7 days)
             *   `AND lastKnownContentHash IS NOT NULL`
             *   Optional: `AND blockType = [new_block_type]` (if feasible and indexed)
             *   *(Ensure query uses indexes defined in Phase 1)*.
        3.  **Compare Signatures:** Compare the signature of the new block against the `lastKnownContentHash` of the candidate deleted blocks.
             *   Use an appropriate matching strategy (exact match for hashes, threshold for similarity scores).
        4.  **Flag Submission:** If a match is found (above a configured threshold if using similarity scores):
             *   Update the corresponding `pendingSubmissions` record: set `isPotentialRecreation = true`.
             *   Store the `blockId` of the *matched deleted block* in `potentialOriginalBlockId`.
    *   **Content Hashing/Similarity:**
        *   **Text Blocks:** Calculate a robust signature.
            *   *Baseline:* SHA-256 hash of normalized text content (e.g., trimmed, lowercased, punctuation removed).
            *   *Recommendation:* Implement **Jaccard similarity based on trigrams (n=3)** of normalized text (trimmed, lowercased, whitespace normalized). Store the set of trigrams or a MinHash signature derived from them.
        *   **Non-Text Blocks (Image, Quiz, Equation, etc.):**
            *   *Baseline:* Generate a hash (e.g., SHA-256) of the canonical (sorted keys, consistent spacing), serialized `nodeJson` for the block as a baseline.
            *   *Future Enhancements:* Consider perceptual hashing (pHash) for images, structural comparison hashes for quizzes/collapsibles, or specialized hashes for equations if baseline proves insufficient.
        *   **Storage:** The calculated signature/hash should be stored in the `blocks.lastKnownContentHash` field *when a block is deleted* (see Step 3 - Handle Deleted Blocks).
    *   **Configuration:**
        *   `ConfigurableRecentWindow`: Time period to check for deleted blocks (e.g., '7 days').
        *   `SimilarityThreshold`: Minimum Jaccard similarity score to consider a match for text blocks (e.g., **0.85**).
    *   **Performance Considerations:**
        *   Running this asynchronously might be necessary if checking against many deleted blocks becomes slow.
        *   *(Rely on indexing strategy defined in Phase 1)*.

2.  **Content Diffing Logic (`diffingService.ts`):**
    *   **Input:** `submittedLexicalStateJson` (object), `approvedLexicalStateJson` (object) // Approved state from current `contentVersion`.
    *   **Process:**
        *   Parse both JSON inputs.
        *   Extract all block nodes (`{ blockId: string, nodeJson: object }`) from both states into Maps (`Map<blockId, nodeJson>`).
        *   **Identify Changes:**
            *   `added`: Blocks present in `submitted` but not `approved`.
            *   `deleted`: Blocks present in `approved` but not `submitted` (by `blockId`).
            *   `modified`: Blocks present in both where `nodeJson` differs. Use robust comparison (e.g., serialize & compare strings, or deep object comparison).
    *   **Output:**
        ```typescript
        type DiffResult = {
          added: Array<{ blockId: string; nodeJson: object }>;
          deleted: Array<{ blockId: string; nodeJson: object }>; // Include oldNodeJson for context
          modified: Array<{ blockId: string; oldNodeJson: object; newNodeJson: object }>;
        };
        ```

3.  **Ownership Calculation Logic (`ownershipService.ts`):**
    *   **Implements Hybrid Model (details in Section 3 of spec).**
    *   **Input:** `diffResult` (from Step 1), `submitterUserId` (string), `currentContentVersionId` (UUID), `newContentVersionId` (UUID), `tocItemId` (UUID).
    *   **Configuration:** Access configured values from `src/config/contributionConfig.ts`: `min_impact_threshold` (**0.05**), `modifier_share_factor` (**0.6**), `max_transfer_cap` (**0.5**).
    *   **Database Interaction:** Must operate within a Drizzle transaction (`tx`).
    *   **Process:**
        *   **Handle Added Blocks:** For each `block` in `diffResult.added`:
            *   Insert into `blocks` (`blockId`, `originalCreatorId` = `submitterUserId`, `blockType` from `nodeJson`, `courseId`/`contentUnitId`, `creationTimestamp`, initial `status`='active', calculate `blockWeight`, `blockContentValue`, `blockValue`).
            *   Insert into `block_versions` (`id`=new UUID, `blockId`, `contentVersionId` = `newContentVersionId`, `tocItemId`, `blockType`, `blockValueSnapshot` = calculated `blockValue`, `blockReputationScoreSnapshot` = 50, `ownershipSnapshot` = `{ [submitterUserId]: 100.00 }`). Let this be `newBlockVersion`.
            *   Insert into `ownership` (`blockVersionId` = `newBlockVersion.id`, `userId` = `submitterUserId`, `percentage` = 100.00).
            *   Log 'CREATE' event in `contributionHistory`.
        *   **Handle Deleted Blocks:** For each `block` in `diffResult.deleted`:
            *   Update `blocks` status to 'archived' for `block.blockId`.
            *   Calculate and store the content signature/hash in `blocks.lastKnownContentHash` for `block.blockId` (using logic from Step 1 - Content Hashing/Similarity).
            *   Set `deletedAt = now()` for `block.blockId`.
            *   Log 'DELETE' event in `contributionHistory`.
            *   *(Consider anti-gaming checks later).*
        *   **Handle Modified Blocks:** For each `block` in `diffResult.modified`:
            *   **Content Diff (`impact`):** Perform specific diff between `oldNodeJson` and `newNodeJson`.
                *   Use `diff` library (`diffChars`) for text nodes to get `Impact` (0-1).
                *   For non-text, assume `Impact = 1.0` if different, `0` if identical (add comments for future logic).
            *   Fetch previous block version (`prevBlockVersion`) from `block_versions` for `block.blockId` and `currentContentVersionId`. Get its `ownershipSnapshot`.
            *   **Recalculate Block Value:** Calculate `newBlockValue` based on `newNodeJson` (logic from Phase 3).
            *   **Apply Ownership Logic:**
                *   If `Impact >= min_impact_threshold`:
                    *   Calculate `PotentialTransfer = Impact * modifier_share_factor`.
                    *   `ActualTransfer = min(PotentialTransfer, max_transfer_cap)`.
                    *   Calculate `newOwnershipMap`: proportionally reduce existing owners' shares from `prevBlockVersion.ownershipSnapshot` by `ActualTransfer`, add `ActualTransfer` to `submitterUserId`'s share (or create), normalize to sum 100.00.
                    *   Log 'MAJOR_EDIT' and 'OWNERSHIP_TRANSFER' events in `contributionHistory`.
                *   Else (Impact below threshold):
                    *   `newOwnershipMap` = `prevBlockVersion.ownershipSnapshot`. // No ownership change
                    *   Log 'MINOR_EDIT' event in `contributionHistory` (or just update `lastModified`).
            *   **Create New Version Snapshot & Update Block:**
                *   Insert into `block_versions` (`id`=new UUID, `blockId`, `contentVersionId` = `newContentVersionId`, `tocItemId`, `blockType` from `newNodeJson`, `blockValueSnapshot` = `newBlockValue`, `blockReputationScoreSnapshot` = 50, `ownershipSnapshot` = `newOwnershipMap`). Let this be `newBlockVersion`.
                *   Insert corresponding records into `ownership` table based on `newOwnershipMap` for `newBlockVersion.id`.
                *   Update the main `blocks` record for `block.blockId` with `lastModifiedTimestamp`, `lastModifierId` = `submitterUserId`, latest `blockType`, `blockValue` = `newBlockValue`, etc.
        *   **Temporary Calculation:** This entire logic MUST also be runnable *temporarily* (without committing the transaction) to show potential impact (diff, value change, ownership shift) to the reviewer in the Admin UI.

## Phase 3: Approval Workflow & UI

**Goal:** Implement the user interface and API endpoints for reviewing and actioning submissions, utilizing the services built in Phase 2.

**Prerequisites:** Phase 1 and Phase 2 complete.

**Design Context:**

*   **Approver Empowerment:** The UI must clearly present diffs, potential impact previews, warnings (like delete/recreate flags), and submitter reputation to enable informed decisions.
*   **Workflow Actions:** Provide clear actions for Approve, Reject, and the conditional "Approve (Treat as Edit)".
*   **Error Handling:** API endpoints should return clear success/error responses (e.g., appropriate HTTP status codes, informative messages).

**Phase 3 Implementation Requirements:**

1.  **Admin/Approval Dashboard UI:**
    *   **Location:** Protected route (e.g., `/admin/approval`).
    *   **Functionality:**
        *   List pending submissions (`pendingSubmissions` where `status = 'pending'`).
        *   Display key info: Submitter (`userId` + join `profiles` for name), `tocItemId`, `createdAt`.
        *   **Display Submitter Reputation:** Show the submitter's `contributorReputationScore`.
        *   On selecting a submission:
            *   Display visual diff between `submittedLexicalStateJson` and current approved state (use a React diff viewer component).
            *   Display potential impact preview by calling the Core Engine services (Phase 2) in 'dry-run' mode (show potential value changes, ownership shifts).
            *   **Display Delete/Recreate Warning:** If `pendingSubmission.isPotentialRecreation` is true, show the warning: "Warning: Submitted content is highly similar to a recently deleted block (Original ID: [potentialOriginalBlockId]). This might be an attempt to recreate content."
        *   **Action Buttons:** Provide "Approve", "Reject" buttons. If `isPotentialRecreation` is true, also provide "Approve (Treat as Edit)".

2.  **Approval/Rejection API Endpoints:**
    *   **Location:** **Prefer Server Actions** callable from the Admin UI components. If complex logic requires separation, Route Handlers (e.g., `app/api/contributions/[submissionId]/approve/route.ts`, `.../reject/route.ts`) can be used.
    *   **Key Dependencies:** `diffingService`, `ownershipService` (from Phase 2).
    *   **Permissions:** Check if the calling user `canApprove` (from `profiles`). Reject 403 if not.
    *   **Approval Endpoint (`/approve`):**
        *   **Input:** `submissionId`, optional `treatAsEdit: boolean`, `potentialOriginalBlockId` (if `treatAsEdit`).
        *   Retrieve `pendingSubmission`.
        *   Fetch current approved state for `tocItemId`.
        *   Create new `contentVersion` record, get `newContentVersionId`.
        *   **Call Core Engine (Transaction):** Wrap in `db.transaction`:
            *   *(Critical: Ensure atomicity across block/version/ownership updates and submission status change)*.
            *   If `treatAsEdit` is true:
                *   Identify the relevant block in submission.
                *   Call Core Engine (Phase 2 `ownershipService`) using modification logic for that block (passing `potentialOriginalBlockId`).
                *   Update original block status/`deletedAt` in `blocks`.
                *   Handle *other* blocks in submission normally (calling diff/ownership logic).
            *   Else (normal approval):
                *   Call Core Engine (Phase 2 `diffingService`, `ownershipService`) for the entire submission.
            *   Update `pendingSubmission.status` to 'approved'.
            *   Update `tocItems` to point to `newContentVersionId`.
        *   Return success response (e.g., 200 OK).
    *   **Rejection Endpoint (`/reject`):**
        *   **Input:** `submissionId`.
        *   Retrieve `pendingSubmission`.
        *   Update `pendingSubmission.status` to 'rejected'.
        *   (Optional: Handle rejection reason, log event).
        *   Return success response (e.g., 200 OK).

## Phase 4: Feedback System

**Goal:** Implement the user feedback capture and display mechanism.

**Prerequisites:** Phase 1 complete.

**Design Context:**

*   Focus on capturing user reactions (like, dislike, flag) tied to specific `block_versions`.
*   Handle duplicate/update logic correctly (e.g., replacing like with dislike).
*   Use `shadcn-ui` for frontend elements.
*   **Error Handling:** API endpoint needs validation and appropriate error responses.

**Phase 4 Implementation Requirements:**

1.  **Block Value Calculation Logic (Refinement from old Phase 3):**
    *   **Note:** This logic is defined and integrated within the `ownershipService` (Phase 2), but configuration values are listed here for clarity.
    *   **Configuration (`src/config/contributionConfig.ts`):** Define base `blockWeight` values per `blockType`. Recommended defaults:
        *   `HorizontalRuleNode`: 1
        *   `HeadingNode`: 2
        *   `QuoteNode`: 2
        *   `ParagraphNode`: 3
        *   `ListNode` / `ListItemNode`: 3
        *   `CodeNode`: 5 (Refined calculation below)
        *   `TableNode`: 6
        *   `ImageNode`: 6 (Refined calculation below)
        *   `EquationNode`: 7 (Refined calculation below)
        *   `MCQContainerNode`: 12 (Refined calculation below)
        *   `CollapsibleContainerNode`: 10
        *   *Future Audio/Video: 8*
    *   **Implement `ContentVolumeFactor` Calculation (Helper Functions in `ownershipService` or `blockValueService`):** Calculate normalized factor (0.0 to 1.0) based on `nodeJson`:
        *   **Text-based (Paragraph, Quote, List, Heading):** `log10(max(1, num_chars / 50))` normalized against `log10(2000 / 50)`. Clamp [0.0, 1.0]. (`TargetMaxChars = 2000`).
        *   **Image:** Base 0.1 + AltBonus (if alt text exists/long) 0.3 + CaptionBonus (if caption exists/long) 0.3. Max 0.7. Clamp [0.0, 1.0].
        *   **Quiz (MCQ):** Factor based on `log10(max(1, TotalComplexity))` (e.g., num questions/options, has explanation). Normalize against `log10(20)`. (`TargetMaxComplexity = 20`). Clamp [0.0, 1.0].
        *   **Equation:** `log10(max(1, num_chars / 15))` normalized against `log10(500 / 15)`. (`TargetMaxChars_Eq = 500`, `ScalingFactor = 15`). Clamp [0.0, 1.0].
        *   **Code:** `log10(max(1, LOC))` (Lines of Code, non-empty) normalized against `log10(50)`. (`TargetMaxLOC = 50`). Clamp [0.0, 1.0].
        *   *Future Audio/Video: `log10(max(1, duration_seconds / 30))` normalized against target (e.g., 600s). Clamp [0.0, 1.0].*
    *   **Calculate Final `blockValue`:** `blockValue = blockWeight * (1 + ClampedNormalizedContentVolumeFactor)`.
    *   **(Database update logic handled within Phase 2 `ownershipService`).**

2.  **Feedback Submission API:**
    *   **Database Schema:** Use the `feedback` table defined in Phase 1.
    *   **API Route:** Create a **Server Action** callable from the feedback UI components.
    *   **Input:** `{ blockVersionId: string, feedbackType: 'LIKE' | 'DISLIKE' | 'FLAG', flagReason?: string, comment?: string }`.
    *   **Authentication & Validation:** Get authenticated `userId`. Verify `blockVersionId` exists and links to an active/approved block/version. Validate `feedbackType`. If 'FLAG', ensure `flagReason` is provided and valid.
    *   **Duplicate/Update Handling Logic (within a transaction `tx`):**
        *   **Like/Dislike:**
            *   Atomically delete any existing 'LIKE' or 'DISLIKE' from this `userId` for this `blockVersionId`.
            *   Insert the new feedback record (`feedbackType`, `userId`, `blockVersionId`, optional `comment`).
        *   **Flag:**
            *   Check if an active 'FLAG' (`flagStatus` = 'OPEN' or 'UNDER_REVIEW') exists from this `userId` for this `blockVersionId`. If yes, reject (409 Conflict or update existing?). Decide policy - prevent multiple active flags per user per block version.
            *   If no active flag, insert new record (`feedbackType`='FLAG', `userId`, `blockVersionId`, `flagReason`, optional `flagComment`, `flagStatus`='OPEN').
    *   **Database Interaction:** Use DrizzleORM client within a transaction.
    *   **Response:** Return 2xx on success, appropriate error codes (400, 401, 403, 404, 409) on failure.

3.  **Feedback Frontend UI (`shadcn-ui`):**
    *   **Location:** In the React component rendering individual blocks (needs `blockVersionId`).
    *   **UI Elements:** Add interactive `Button` components (`ThumbsUp`, `ThumbsDown`, `Flag`) near each block. Style based on user's current feedback state.
    *   **Feedback Counts:** Fetch and display current like/dislike counts for the `blockVersionId` (See Step 4).
    *   **State Management:** Track user's own feedback state (`null`, 'liked', 'disliked', 'flagged') for the specific `blockVersionId` to update UI optimistically and prevent redundant API calls.
    *   **API Interaction:** On button click:
        *   Update UI optimistically.
        *   Call `/api/feedback/submit` with `blockVersionId`, `feedbackType`.
        *   Handle API response (confirm success or revert optimistic update on error).
    *   **Flag Dialog:** On Flag button click:
        *   Open a `Dialog` or `Popover` (`shadcn/ui`).
        *   Include `Select` for `flagReason` (using the defined Enum values).
        *   Include `Textarea` for optional `flagComment`.
        *   On submit, call `/api/feedback/submit` with type 'FLAG', `blockVersionId`, `flagReason`, and `flagComment`.

4.  **Feedback Count Fetching:**
    *   **Backend API:** Create a **Route Handler** `/api/feedback/counts?blockVersionIds=id1,id2,...` (or similar batch endpoint).
        *   Input: List of `blockVersionId`s.
        *   Process: Query `feedback` table, `COUNT` and group by `blockVersionId` and `feedbackType` ('LIKE', 'DISLIKE').
        *   Output: Map `blockVersionId` -> `{ likes: number, dislikes: number }`.
    *   **Frontend:** Fetch counts for visible block versions and pass them to the rendering component.

## Phase 5: Reputation, View Tracking & Display

**Goal:** Implement view tracking, calculate reputation scores via scheduled functions, and display scores and contributor info in the UI.

**Prerequisites:** Phase 1, 2, 3, 4 complete.

**Design Context:**

*   **Asynchronous Calculation:** Reputation scores are complex and best calculated periodically/asynchronously using Supabase Scheduled Functions to avoid blocking user requests.
*   **View Tracking:** Track views per `block_versions` to inform reputation and potential future analytics. Implement basic rate-limiting.
*   **Display:** Integrate reputation scores and contributor info subtly into the UI.

**Phase 5 Implementation Requirements:**

1.  **View Tracking Implementation:**
    *   **Database:** Use the `viewCount` column added to `block_versions` in Phase 1 schema.
    *   **Backend API:** Create a **Route Handler** `app/api/views/track/route.ts`.
        *   **Input:** POST with JSON body: `{ blockVersionId: string }`.
        *   **Authentication:** Get authenticated `userId`.
        *   **Rate Limiting/Debouncing:** Crucial to prevent abuse. Only count one view per `userId` per `blockVersionId` within a defined period (e.g., 1 hour or 1 day). Use a separate cache (Redis/Upstash) or a dedicated `viewLogs` table to track recent views (`userId`, `blockVersionId`, `timestamp`).
        *   **Database Interaction:** If view is valid (passes rate limit check):
            *   Increment `viewCount` for the `blockVersionId` in `block_versions` using DrizzleORM (`increment`).
        *   **Response:** Return 200 OK (even if rate-limited/debounced on the client/server logic).
    *   **Frontend:**
        *   In the component rendering blocks (receiving `blockVersionId`), use `IntersectionObserver` API.
        *   When a block version becomes sufficiently visible (e.g., >50% intersection for >1 second), trigger a debounced function.
        *   This function calls the `/api/views/track` endpoint.

2.  **Block Reputation Calculation (Supabase Scheduled Function):**
    *   **Function:** `calculate-block-reputation`.
    *   **Scheduling:** Run periodically (e.g., hourly or every few hours).
    *   **Logic:**
        *   Identify `block_versions` records needing reputation updates (e.g., those associated with recent feedback or views, or process all active versions in batches).
        *   For each target `blockVersionId`:
            *   Fetch necessary data using Drizzle:
                *   Feedback counts/details: Query `feedback` where `blockVersionId` matches the target `blockVersionId`. Get counts of types and `userId` of voters.
                *   `viewCount`: Fetch directly from the target `block_versions` record.
                *   `createdAt`: Fetch from the target `block_versions` record (for decay calculation).
            *   **Apply Algorithm (Based on Spec Section 4):**
                *   Define weights (configurable in `src/config/contributionConfig.ts`): `W_Like = +1`, `W_Dislike = -3`, `W_Flag = -10` (consider adjustment based on `flagStatus`), `W_View = +5`.
                *   **Calculate `UserReputationWeight` (Refinement):**
                    *   For each feedback item, fetch the voter's `contributorReputationScore` from `profiles`.
                    *   *Recommendation:* Use simple linear mapping: `Weight = max(0.5, min(1.5, 0.5 + (Score / MaxScore)))`. Assume `MaxScore` (e.g., 1000) is defined. Handle default/zero scores appropriately (e.g., assign weight 0.75 or 1.0).
                *   `FeedbackScore = Sum(feedbackValue * UserReputationWeight)`. // Sum over feedback for *this* `blockVersionId`
                *   `ViewScore = log10(1 + block_versions.viewCount) * W_View`. *(`[Optional Refinement]` Defer 'Quality Views' concept for simplicity initially)*.
                *   `RawScore = 50 + FeedbackScore + ViewScore`. // Base 50
                *   `ClampedScore = max(0, min(100, RawScore))`.
                *   Calculate `days_since_creation = (now - block_versions.createdAt) / (days)`. Decay constant `k` (configurable, e.g., **0.001**).
                *   `DecayFactor = exp(-k * days_since_creation)`.
                *   `FinalScore = ClampedScore * DecayFactor`. // Or potentially apply decay differently
            *   **Database Update:** Update `blockReputationScoreSnapshot` in the `block_versions` table for the target `blockVersionId`. Use batch updates for efficiency.

3.  **Contributor Reputation Calculation (Supabase Scheduled Function):**
    *   **Function:** `calculate-contributor-reputation`.
    *   **Scheduling:** Run periodically (e.g., daily).
    *   **Logic:**
        *   Iterate through users (`profiles`).
        *   For each `userId`:
            *   Fetch all `ownership` records for the user.
            *   **Join `ownership` with `block_versions`** (`ownership.blockVersionId` -> `block_versions.id`).
            *   **Filter:** Consider only `ownership` records linked to `block_versions` where the corresponding `contentVersions.status == 'approved'`. *(Requires joining `block_versions` to `contentVersions`)*.
            *   Get `block_versions.blockValueSnapshot` and `block_versions.blockReputationScoreSnapshot` for these filtered records.
            *   **Apply Algorithm (Based on Spec Section 4):**
                *   `WVC = Sum[ bv.blockValueSnapshot * o.percentage/100 * (bv.blockReputationScoreSnapshot / 50) ]` over filtered records (`o`=ownership, `bv`=block_version). Quality multiplier `(bv.blockReputationScoreSnapshot / 50)`.
                *   *Recommendation (Initial Simplicity):* Focus only on `WVC` for the initial calculation.
                *   `BaseRep = log10(1 + max(0, WVC))`
                *   Define Weights (configurable): `Weight_WVC = 10`. *(Ignore AB, VS, PS weights initially)*
                *   `FinalReputation = BaseRep * Weight_WVC`. (Apply clamping/normalization if needed, e.g., max 1000).
                *   *Future Enhancements:* Incorporate `ActivityBonus`, `ValidationScore`, `PenaltyScore` with associated tracking and weights.
                *   `[Future Enhancement]` Incorporate `ActivityBonus`, `ValidationScore`, `PenaltyScore` with associated tracking and weights.
            *   **Database Update:** Update `contributorReputationScore` in the `profiles` table for the `userId`. Use batch updates.

4.  **Frontend Display Implementation:**
    *   **Block Reputation & Contributors:**
        *   Display the `blockReputationScoreSnapshot` from the fetched `block_versions` record visually (number, stars, color).
        *   **Reputation Clarity:** Add tooltips (`Tooltip` component) explaining the score briefly (e.g., "Based on user feedback, views, and freshness").
        *   Fetch contributor info for the *specific* `blockVersionId` being viewed: Query `ownership` table filtered by `blockVersionId`. Join with `profiles` to get user details (`name`, `avatar`) and display the list with percentages near the block.
        *   **Ownership Display Format:** *Recommendation:* Display Top 3 contributors + percentages visibly. Add a tooltip or button to show the full list if > 3.
        *   **Contribution History:** Add a "History" button/link. On click, open a `Dialog` showing major events (`contributionHistory` table: creation, major edits, deletion/restoration) with user/timestamp for the relevant `blockId`.
    *   **Contributor Reputation:**
        *   Fetch `contributorReputationScore` from `profiles` when displaying user profiles, tooltips on contributor lists, etc.
        *   **Reputation Clarity:** Add tooltips explaining the score briefly (e.g., "Overall contribution score based on value and quality").

## Phase 6: Anti-Gaming Monitoring, Admin Tools, Refinements & Compensation Foundation

**Goal:** Enhance monitoring, provide admin tools, refine system parameters, and prepare for compensation.

**Prerequisites:** Phase 1-5 complete.

**Phase 6 Implementation Requirements:**

1.  **Anti-Gaming Enhancements:**
    *   **Delete/Recreate:** Implementation details covered in Phase 1 (Schema) and Phase 2 (Detection & Handling). Focus here is on monitoring effectiveness and refining the detection window/hashing.
    *   **Feedback Abuse Monitoring:** Implement basic checks in scheduled functions or admin views to identify users with statistically anomalous feedback patterns (e.g., extremely high like/dislike ratios, mass flagging). Flag for admin review.
    *   **Edit Churn Monitoring:** Monitor `contributionHistory` for patterns of rapid, low-impact edits ('MINOR_EDIT' events) on the same block by the same user. The `min_impact_threshold` is the primary defense, but patterns can be flagged.

2.  **Basic Admin Monitoring:**
    *   **Location:** Create pages under a protected `/admin` route (check user profile for `isAdmin` flag).
    *   **Flagged Content Page:** Display a list/table of blocks with active flags (`feedback.feedbackType='FLAG'` and `feedback.flagStatus='OPEN'/'UNDER_REVIEW'`). Show block snippet, `flagReason`, `flaggerId`, timestamp. Include actions for admins to update `flagStatus` (e.g., 'RESOLVED_ACCEPTED', 'RESOLVED_REJECTED').
    *   **Fields to Display:** Block content snippet/link, `feedback.flagReason`, `feedback.userId` (or associated username from `profiles` via join), `feedback.createdAt`.
    *   **Actions:** Allow admins to update `feedback.flagStatus` (e.g., to 'RESOLVED_ACCEPTED', 'RESOLVED_REJECTED'), potentially setting `feedback.resolverId` and `feedback.resolvedAt`.
    *   **User Overview Page:** Table listing users (`profiles`), `contributorReputationScore`, join date, maybe a count of active contributions (derived from `ownership`/`blocks`). Allow sorting.

3.  **Refinements:**
    *   Review and tune configurable parameters (ownership thresholds, reputation weights, decay constants, value calculation factors, anti-gaming detection windows) based on initial data and observation.
    *   Improve diffing logic for non-text blocks beyond simple equality checks where feasible (e.g., structural comparison for quizzes).
    *   Refine UI elements based on user feedback (e.g., clarity of warnings, history display).

4.  **Compensation Model Foundation:**
    *   `[Future Enhancement]` Note: The core logic here supports future compensation but actual payout implementation is deferred.
    *   **Prerequisite:** Need a system to log paid user interactions (e.g., `userInteractions` table) associating `userId`, `blockVersionId` (the specific version viewed/interacted with), `interactionType`, and `timestamp`.
    *   **Mechanism Design:**
        *   Define compensable interaction types and criteria (e.g., view duration > N seconds).
        *   Periodically (e.g., monthly batch process):
            *   Identify compensable `userInteractions`.
            *   For each interaction, get the `blockVersionId`.
            *   Query the `block_versions` table to retrieve the historical `blockValueSnapshot` and `ownershipSnapshot` for that specific version.
            *   Define `RatePerValuePoint` (*Needs Definition Later*).
            *   Calculate and distribute/log compensation per contributor `i`: `Compensation_i = RatePerValuePoint * blockValueSnapshot * ownershipSnapshot[i]`.
    *   **Implementation:** Implement the `userInteractions` logging. Design (and potentially implement) the core logic for querying `block_versions` and calculating potential payouts, even if actual payouts are deferred.

## Phase 7: Iteration

**Goal:** Ongoing improvement based on usage and feedback.

**Prerequisites:** Phase 1-6 complete.

**Phase 7 Implementation Requirements:**

1.  **Iteration:**
    *   Continuously gather user feedback on the fairness and accuracy of the system.
    *   Be prepared to adjust formulas, weights, thresholds, and algorithms based on data, feedback, and evolving platform goals.
    *   Refine anti-gaming mechanisms as new patterns emerge.

**Guiding Principles for AI Agent:**

*   **Phased Implementation:** Follow the requirements phase by phase. Do not implement logic from later phases prematurely unless specified.
*   **Configuration:** All specified constants, thresholds, and weights should be managed centrally, ideally in `/config/contributionConfig.ts`, and accessed by relevant services.
*   **Database:** All database interactions must use the specified DrizzleORM client. Critical multi-step operations (especially involving creation/updates across `blocks`, `block_versions`, `ownership`, `pendingSubmissions` status) MUST be wrapped in atomic transactions (`db.transaction(...)`).
*   **Schema as Source of Truth:** The Database Schema Definition in Phase 1 is the definitive source for table structures, types, and constraints.
*   **Code Location:** References to file paths (e.g., `diffingService.ts`) indicate the intended location for the described logic.
*   **Future/Optional:** Items marked `[Future Enhancement]` or `[Optional Refinement]` are not required for the current phase's core implementation.

**Assumptions:**

*   **External Table Dependencies:** The following tables (some defined locally in `db/schema.ts`, some external like `auth.users`) are assumed to exist and be accessible:
    *   `auth.users`: Supabase Auth table providing user identity.
    *   `users`: Local table defined in Phase 1 schema, assumed to map/link to `auth.users`.
    *   `courses`: Must have `id`.
    *   `contentVersions`: Defined in Phase 1 schema. Must have `id` and the added `status` field.
    *   `tocItems`: Must have `id`.
*   A UUID generation utility is available.
*   Standard JS/TS libraries for hashing (e.g., `crypto` module) and potentially diffing (e.g., `diff` library) are available.
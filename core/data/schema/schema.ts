import { sql } from 'drizzle-orm';
import { pgTable, text, varchar, timestamp, uuid, primaryKey, integer, pgEnum, boolean, jsonb, smallint, unique, foreignKey, index, numeric, check } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Enums ---

export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced', 'expert']);
export const actionTypeEnum = pgEnum('action_type', ['add', 'edit', 'delete']);

// Contribution Tracking Enums (Phase 1)
export const blockTypeEnum = pgEnum('block_type_enum', ['paragraph', 'heading', 'list', 'list_item', 'quote', 'code', 'image', 'mcq', 'collapsible', 'equation', 'table', 'horizontal_rule']);
export const blockStatusEnum = pgEnum('block_status_enum', ['active', 'archived', 'flagged_for_review', 'deleted']);
export const feedbackTypeEnum = pgEnum('feedback_type_enum', ['LIKE', 'DISLIKE', 'FLAG']);
export const flagReasonEnum = pgEnum('flag_reason_enum', ['INACCURATE', 'OUTDATED', 'UNCLEAR', 'BROKEN_INTERACTIVITY', 'COPYRIGHT_VIOLATION', 'SPAM', 'OTHER']);
export const flagStatusEnum = pgEnum('flag_status_enum', ['OPEN', 'UNDER_REVIEW', 'RESOLVED_ACCEPTED', 'RESOLVED_REJECTED', 'RESOLVED_DUPLICATE']);
export const historyEventEnum = pgEnum('history_event_enum', ['CREATE', 'MAJOR_EDIT', 'MINOR_EDIT', 'DELETE', 'RESTORE', 'STATUS_CHANGE', 'OWNERSHIP_TRANSFER']);
export const submissionStatusEnum = pgEnum('submission_status_enum', ['pending', 'approved', 'rejected']);
export const contentVersionStatusEnum = pgEnum('content_version_status_enum', ['draft', 'approved', 'archived']);

// --- Tables ---

// 1. User
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username').unique(),
    email: varchar('email').unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    // *(Other profile fields)* - Add other profile fields here as needed
});

// 2. Tag
export const tags = pgTable('tags', {
    id: varchar('id').primaryKey(), // The tag string itself
    description: text('description'),
});

// 3. LearningPath
export const learningPaths = pgTable('learning_paths', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 4. LearningPathTag (Junction Table)
export const learningPathTags = pgTable('learning_path_tags', {
    learningPathId: uuid('learning_path_id').notNull().references(() => learningPaths.id),
    tagId: varchar('tag_id').notNull().references(() => tags.id),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.learningPathId, table.tagId] }),
    };
});

// 5. Course
export const courses = pgTable('courses', {
    id: varchar('id').primaryKey(), // e.g., 'calculus-1'
    title: varchar('title').notNull(),
    description: text('description').notNull(),
    difficulty: difficultyEnum('difficulty').notNull(),
    estimatedHours: integer('estimated_hours'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 6. CourseTag (Junction Table)
export const courseTags = pgTable('course_tags', {
    courseId: varchar('course_id').notNull().references(() => courses.id),
    tagId: varchar('tag_id').notNull().references(() => tags.id),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.courseId, table.tagId] }),
    };
});

// 7. LearningPathNode
export const learningPathNodes = pgTable('learning_path_nodes', {
    id: uuid('id').primaryKey().defaultRandom(),
    learningPathId: uuid('learning_path_id').notNull().references(() => learningPaths.id),
    courseId: varchar('course_id').notNull().references(() => courses.id),
}, (table) => {
    return {
        // *(UNIQUE constraint on (`learning_path_id`, `course_id`) recommended)*
        unq: unique().on(table.learningPathId, table.courseId),
    };
});

// 8. LearningPathEdge
export const learningPathEdges = pgTable('learning_path_edges', {
    id: uuid('id').primaryKey().defaultRandom(),
    learningPathId: uuid('learning_path_id').notNull().references(() => learningPaths.id),
    sourceNodeId: uuid('source_node_id').notNull().references(() => learningPathNodes.id),
    targetNodeId: uuid('target_node_id').notNull().references(() => learningPathNodes.id),
});

// 9. Branch
export const branches = pgTable('branches', {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: varchar('course_id').notNull().references(() => courses.id),
    name: varchar('name').notNull(), // e.g., 'main', 'draft/user-uuid-123'
    isDefault: boolean('is_default').default(false).notNull(),
    createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        // *(UNIQUE constraint on (`course_id`, `name`))*
        unq: unique().on(table.courseId, table.name),
    };
});

// 10. ContentUnit
export const contentUnits = pgTable('content_units', {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: varchar('course_id').notNull().references(() => courses.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 11. TocItem (Table of Contents Item)
export const tocItems = pgTable('toc_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    branchId: uuid('branch_id').notNull().references(() => branches.id),
    parentTocItemId: uuid('parent_toc_item_id'), // Define column first
    contentUnitId: uuid('content_unit_id').notNull().references(() => contentUnits.id),
    name: varchar('name').notNull(),
    type: varchar('type').notNull(), // e.g., 'title', 'chapter', 'lesson'
    order: smallint('order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        // Define self-referencing foreign key separately
        parentReference: foreignKey({
            columns: [table.parentTocItemId],
            foreignColumns: [table.id]
        }).onDelete('set null'), // Consider cascade or set null behavior
        // Add index for faster lookups by branchId and parentTocItemId
        branchParentIdx: index("toc_items_branch_parent_idx").on(table.branchId, table.parentTocItemId),
    };
});

// 12. ContentVersion (Updated with status)
export const contentVersions = pgTable('content_versions', {
    id: uuid('id').primaryKey().defaultRandom(),
    contentUnitId: uuid('content_unit_id').notNull().references(() => contentUnits.id),
    branchId: uuid('branch_id').notNull().references(() => branches.id),
    contributorId: uuid('contributor_id').notNull().references(() => users.id),
    approverId: uuid('approver_id').references(() => users.id), // Nullable
    lexicalState: jsonb('lexical_state'), // Or text('lexical_state')
    commitMessage: text('commit_message').notNull(),
    status: contentVersionStatusEnum('status').default('draft').notNull(), // Added status column
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// --- Contribution Tracking Tables (Phase 1) ---

// 13. Profiles (Extending Users)
export const profiles = pgTable('profiles', {
    // Use the same UUID as the users table for a 1:1 relationship
    userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    contributorReputationScore: numeric('contributor_reputation_score', { precision: 10, scale: 2 }).default('0').notNull(),
    canApprove: boolean('can_approve').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(), // Consider using .onUpdateNow() if supported/desired
});

// 14. Blocks
export const blocks = pgTable('blocks', {
    blockId: uuid('block_id').primaryKey(), // Persistent ID
    courseId: varchar('course_id').notNull().references(() => courses.id),
    originalCreatorId: uuid('original_creator_id').notNull().references(() => users.id),
    creationTimestamp: timestamp('creation_timestamp', { withTimezone: true }).defaultNow().notNull(),
    blockType: blockTypeEnum('block_type').notNull(),
    status: blockStatusEnum('status').default('active').notNull(),
    contentUnitId: uuid('content_unit_id').references(() => contentUnits.id), // Nullable initially, FK to contentUnits
    lastModifierId: uuid('last_modifier_id').references(() => users.id),
    lastModifiedTimestamp: timestamp('last_modified_timestamp', { withTimezone: true }),
    blockWeight: numeric('block_weight', { precision: 5, scale: 2 }).notNull(),
    blockContentValue: numeric('block_content_value', { precision: 5, scale: 2 }).default('0').notNull(),
    blockValue: numeric('block_value', { precision: 10, scale: 2 }).default('0').notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    lastKnownContentHash: text('last_known_content_hash'),
}, (table) => {
    return {
        statusIdx: index("blocks_status_idx").on(table.status),
        blockTypeIdx: index("blocks_block_type_idx").on(table.blockType),
        deletedAtIdx: index("blocks_deleted_at_idx").on(table.deletedAt),
        hashIdx: index("blocks_hash_idx").on(table.lastKnownContentHash),
        // Multi-column index for anti-gaming query
        statusDeletedAtIdx: index("blocks_status_deleted_at_idx").on(table.status, table.deletedAt),
    };
});

// 15. Block Versions
export const blockVersions = pgTable('block_versions', {
    id: uuid('id').primaryKey().defaultRandom(),
    blockId: uuid('block_id').notNull().references(() => blocks.blockId),
    contentVersionId: uuid('content_version_id').notNull().references(() => contentVersions.id),
    tocItemId: uuid('toc_item_id').notNull().references(() => tocItems.id),
    blockType: blockTypeEnum('block_type').notNull(),
    blockValueSnapshot: numeric('block_value_snapshot', { precision: 10, scale: 2 }).notNull(),
    blockReputationScoreSnapshot: numeric('block_reputation_score_snapshot', { precision: 5, scale: 2 }).default('50').notNull(), // Scale 2 for 0-100.00
    ownershipSnapshot: jsonb('ownership_snapshot').notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        // Unique constraint for a block within a content version
        unq: unique().on(table.blockId, table.contentVersionId),
        blockIdIdx: index("block_versions_block_id_idx").on(table.blockId),
        contentVersionIdIdx: index("block_versions_content_version_id_idx").on(table.contentVersionId),
    };
});

// 16. Ownership
export const ownership = pgTable('ownership', {
    blockVersionId: uuid('block_version_id').notNull().references(() => blockVersions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id),
    percentage: numeric('percentage', { precision: 5, scale: 2 }).notNull(), // Allows 100.00
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.blockVersionId, table.userId] }),
        userIdx: index("ownership_user_id_idx").on(table.userId),
        // Check constraint for percentage value
        percentageCheck: check('percentage_check', sql`${table.percentage} >= 0 AND ${table.percentage} <= 100`), // Raw SQL for check constraint
    };
});

// 17. Feedback
export const feedback = pgTable('feedback', {
    feedbackId: uuid('feedback_id').primaryKey().defaultRandom(),
    blockVersionId: uuid('block_version_id').notNull().references(() => blockVersions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id),
    feedbackType: feedbackTypeEnum('feedback_type').notNull(),
    flagReason: flagReasonEnum('flag_reason'),
    flagComment: text('flag_comment'),
    flagStatus: flagStatusEnum('flag_status').default('OPEN').notNull(),
    resolverId: uuid('resolver_id').references(() => users.id),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    comment: text('comment'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        blockVersionIdIdx: index("feedback_block_version_id_idx").on(table.blockVersionId),
        userIdx: index("feedback_user_id_idx").on(table.userId),
        feedbackTypeIdx: index("feedback_feedback_type_idx").on(table.feedbackType),
        flagStatusIdx: index("feedback_flag_status_idx").on(table.flagStatus),
    };
});

// 18. Contribution History
export const contributionHistory = pgTable('contribution_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    blockId: uuid('block_id').notNull().references(() => blocks.blockId),
    userId: uuid('user_id').notNull().references(() => users.id),
    event: historyEventEnum('event').notNull(),
    details: jsonb('details'),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        blockIdIdx: index("contribution_history_block_id_idx").on(table.blockId),
        userIdx: index("contribution_history_user_id_idx").on(table.userId),
        eventIdx: index("contribution_history_event_idx").on(table.event),
    };
});

// 19. Pending Submissions
export const pendingSubmissions = pgTable('pending_submissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    tocItemId: uuid('toc_item_id').notNull().references(() => tocItems.id),
    lexicalStateJson: jsonb('lexical_state_json').notNull(),
    status: submissionStatusEnum('status').default('pending').notNull(),
    isPotentialRecreation: boolean('is_potential_recreation').default(false).notNull(),
    potentialOriginalBlockId: uuid('potential_original_block_id').references(() => blocks.blockId),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        userIdx: index("pending_submissions_user_id_idx").on(table.userId),
        tocItemIdIdx: index("pending_submissions_toc_item_id_idx").on(table.tocItemId),
        statusIdx: index("pending_submissions_status_idx").on(table.status),
    };
});

// --- Relations ---
// Define relations between tables using drizzle-orm `relations` helper

// Example: User relations
export const usersRelations = relations(users, ({ many, one }) => ({
    branchesAuthored: many(branches),
    contentVersionsContributed: many(contentVersions, { relationName: "contributors" }),
    contentVersionsApproved: many(contentVersions, { relationName: "approvers" }),
    // Relation to profiles (one-to-one)
    profile: one(profiles, {
        fields: [users.id],
        references: [profiles.userId],
    }),
    // Relations from users to contribution tables
    createdBlocks: many(blocks, { relationName: 'originalCreator' }),
    modifiedBlocks: many(blocks, { relationName: 'lastModifier' }),
    ownershipEntries: many(ownership),
    feedbackEntries: many(feedback),
    resolvedFeedbacks: many(feedback, { relationName: 'resolver' }),
    historyEvents: many(contributionHistory),
    pendingSubmissions: many(pendingSubmissions),
}));

// Example: Course relations
export const coursesRelations = relations(courses, ({ many }) => ({
    tags: many(courseTags),
    learningPathNodes: many(learningPathNodes),
    branches: many(branches),
    contentUnits: many(contentUnits),
    blocks: many(blocks), // Add relation from course to blocks
}));

// Example: Learning Path relations
export const learningPathsRelations = relations(learningPaths, ({ many }) => ({
    tags: many(learningPathTags),
    nodes: many(learningPathNodes),
    edges: many(learningPathEdges),
}));

// Example: Tag relations
export const tagsRelations = relations(tags, ({ many }) => ({
    learningPaths: many(learningPathTags),
    courses: many(courseTags),
}));


// Example: LearningPathTag relations
export const learningPathTagsRelations = relations(learningPathTags, ({ one }) => ({
    learningPath: one(learningPaths, {
        fields: [learningPathTags.learningPathId],
        references: [learningPaths.id],
    }),
    tag: one(tags, {
        fields: [learningPathTags.tagId],
        references: [tags.id],
    }),
}));

// Example: CourseTag relations
export const courseTagsRelations = relations(courseTags, ({ one }) => ({
    course: one(courses, {
        fields: [courseTags.courseId],
        references: [courses.id],
    }),
    tag: one(tags, {
        fields: [courseTags.tagId],
        references: [tags.id],
    }),
}));


// Example: LearningPathNode relations
export const learningPathNodesRelations = relations(learningPathNodes, ({ one, many }) => ({
    learningPath: one(learningPaths, {
        fields: [learningPathNodes.learningPathId],
        references: [learningPaths.id],
    }),
    course: one(courses, {
        fields: [learningPathNodes.courseId],
        references: [courses.id],
    }),
    sourceEdges: many(learningPathEdges, { relationName: "sourceNodes" }),
    targetEdges: many(learningPathEdges, { relationName: "targetNodes" }),
}));

// Example: LearningPathEdge relations
export const learningPathEdgesRelations = relations(learningPathEdges, ({ one }) => ({
    learningPath: one(learningPaths, {
        fields: [learningPathEdges.learningPathId],
        references: [learningPaths.id],
    }),
    sourceNode: one(learningPathNodes, {
        fields: [learningPathEdges.sourceNodeId],
        references: [learningPathNodes.id],
        relationName: "sourceNodes",
    }),
    targetNode: one(learningPathNodes, {
        fields: [learningPathEdges.targetNodeId],
        references: [learningPathNodes.id],
        relationName: "targetNodes",
    }),
}));

// Example: Branch relations
export const branchesRelations = relations(branches, ({ one, many }) => ({
    course: one(courses, {
        fields: [branches.courseId],
        references: [courses.id],
    }),
    createdByUser: one(users, {
        fields: [branches.createdByUserId],
        references: [users.id],
    }),
    tocItems: many(tocItems),
    contentVersions: many(contentVersions),
}));

// Example: ContentUnit relations
export const contentUnitsRelations = relations(contentUnits, ({ one, many }) => ({
    course: one(courses, {
        fields: [contentUnits.courseId],
        references: [courses.id],
    }),
    tocItems: many(tocItems),
    contentVersions: many(contentVersions),
    blocks: many(blocks), // Add relation from content unit to blocks
}));

// Example: ContentVersion relations (Updated)
export const contentVersionsRelations = relations(contentVersions, ({ one, many }) => ({
    contentUnit: one(contentUnits, {
        fields: [contentVersions.contentUnitId],
        references: [contentUnits.id],
    }),
    branch: one(branches, {
        fields: [contentVersions.branchId],
        references: [branches.id],
    }),
    contributor: one(users, {
        fields: [contentVersions.contributorId],
        references: [users.id],
        relationName: "contributors"
    }),
    approver: one(users, {
        fields: [contentVersions.approverId],
        references: [users.id],
        relationName: "approvers"
    }),
    blockVersions: many(blockVersions), // Add relation from content version to block versions
}));

// Example: TocItem relations (Moved to end)
export const tocItemsRelations = relations(tocItems, ({ one, many }) => ({
    branch: one(branches, {
        fields: [tocItems.branchId],
        references: [branches.id],
    }),
    parentTocItem: one(tocItems, {
        fields: [tocItems.parentTocItemId],
        references: [tocItems.id],
        relationName: 'parentItem' // Define a relation name for self-reference
    }),
    childTocItems: many(tocItems, { relationName: 'parentItem' }), // Children relation
    contentUnit: one(contentUnits, {
        fields: [tocItems.contentUnitId],
        references: [contentUnits.id],
    }),
    blockVersions: many(blockVersions), // Add relation from toc item to block versions
    pendingSubmissions: many(pendingSubmissions), // Add relation from toc item to pending submissions
}));

// --- Contribution Tracking Relations (Phase 1) ---

// Profile relations
export const profilesRelations = relations(profiles, ({ one }) => ({
    user: one(users, {
        fields: [profiles.userId],
        references: [users.id],
    }),
}));

// Block relations
export const blocksRelations = relations(blocks, ({ one, many }) => ({
    course: one(courses, {
        fields: [blocks.courseId],
        references: [courses.id],
    }),
    originalCreator: one(users, {
        fields: [blocks.originalCreatorId],
        references: [users.id],
        relationName: 'originalCreator'
    }),
    contentUnit: one(contentUnits, {
        fields: [blocks.contentUnitId],
        references: [contentUnits.id],
    }),
    lastModifier: one(users, {
        fields: [blocks.lastModifierId],
        references: [users.id],
        relationName: 'lastModifier'
    }),
    blockVersions: many(blockVersions),
    contributionHistory: many(contributionHistory),
    potentialRecreations: many(pendingSubmissions, { relationName: 'potentialOriginalBlock' })
}));

// BlockVersion relations
export const blockVersionsRelations = relations(blockVersions, ({ one, many }) => ({
    block: one(blocks, {
        fields: [blockVersions.blockId],
        references: [blocks.blockId],
    }),
    contentVersion: one(contentVersions, {
        fields: [blockVersions.contentVersionId],
        references: [contentVersions.id],
    }),
    tocItem: one(tocItems, {
        fields: [blockVersions.tocItemId],
        references: [tocItems.id],
    }),
    ownershipEntries: many(ownership),
    feedbackEntries: many(feedback),
}));

// Ownership relations
export const ownershipRelations = relations(ownership, ({ one }) => ({
    blockVersion: one(blockVersions, {
        fields: [ownership.blockVersionId],
        references: [blockVersions.id],
    }),
    user: one(users, {
        fields: [ownership.userId],
        references: [users.id],
    }),
}));

// Feedback relations
export const feedbackRelations = relations(feedback, ({ one }) => ({
    blockVersion: one(blockVersions, {
        fields: [feedback.blockVersionId],
        references: [blockVersions.id],
    }),
    user: one(users, {
        fields: [feedback.userId],
        references: [users.id],
    }),
    resolver: one(users, {
        fields: [feedback.resolverId],
        references: [users.id],
        relationName: 'resolver'
    }),
}));

// ContributionHistory relations
export const contributionHistoryRelations = relations(contributionHistory, ({ one }) => ({
    block: one(blocks, {
        fields: [contributionHistory.blockId],
        references: [blocks.blockId],
    }),
    user: one(users, {
        fields: [contributionHistory.userId],
        references: [users.id],
    }),
}));

// PendingSubmission relations
export const pendingSubmissionsRelations = relations(pendingSubmissions, ({ one }) => ({
    user: one(users, {
        fields: [pendingSubmissions.userId],
        references: [users.id],
    }),
    tocItem: one(tocItems, {
        fields: [pendingSubmissions.tocItemId],
        references: [tocItems.id],
    }),
    potentialOriginalBlock: one(blocks, {
        fields: [pendingSubmissions.potentialOriginalBlockId],
        references: [blocks.blockId],
        relationName: 'potentialOriginalBlock'
    })
}));

// Remember to generate migrations after saving these changes:
// pnpm drizzle-kit:generate

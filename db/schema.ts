import { pgTable, text, varchar, timestamp, uuid, primaryKey, integer, pgEnum, boolean, jsonb, smallint, unique, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Enums ---

export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced', 'expert']);
export const actionTypeEnum = pgEnum('action_type', ['add', 'edit', 'delete']);

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
    };
});

// 12. ContentVersion
export const contentVersions = pgTable('content_versions', {
    id: uuid('id').primaryKey().defaultRandom(),
    contentUnitId: uuid('content_unit_id').notNull().references(() => contentUnits.id),
    branchId: uuid('branch_id').notNull().references(() => branches.id),
    contributorId: uuid('contributor_id').notNull().references(() => users.id),
    approverId: uuid('approver_id').references(() => users.id), // Nullable
    lexicalState: jsonb('lexical_state'), // Or text('lexical_state')
    commitMessage: text('commit_message').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// --- Relations ---
// Define relations between tables using drizzle-orm `relations` helper

// Example: User relations
export const usersRelations = relations(users, ({ many }) => ({
    branchesAuthored: many(branches),
    contentVersionsContributed: many(contentVersions, { relationName: "contributors" }),
    contentVersionsApproved: many(contentVersions, { relationName: "approvers" }),
}));

// Example: Course relations
export const coursesRelations = relations(courses, ({ many }) => ({
    tags: many(courseTags),
    learningPathNodes: many(learningPathNodes),
    branches: many(branches),
    contentUnits: many(contentUnits),
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
}));

// Example: ContentVersion relations
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
        relationName: "contributors",
    }),
    approver: one(users, {
        fields: [contentVersions.approverId],
        references: [users.id],
        relationName: "approvers",
    }),
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
        relationName: "parent",
    }),
    childrenTocItems: many(tocItems, { relationName: "parent" }),
    contentUnit: one(contentUnits, {
        fields: [tocItems.contentUnitId],
        references: [contentUnits.id],
    }),
}));

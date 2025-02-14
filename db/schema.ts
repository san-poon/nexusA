import {
    timestamp,
    text,
    integer,
    pgTable,
    uuid,
    varchar,
    primaryKey,
    PgArray,
    AnyPgColumn,
    pgEnum,
    serial,
    jsonb,
    boolean,
} from "drizzle-orm/pg-core"

import { relations } from 'drizzle-orm';


// Next-auth's schema STARTs here ---------
import type { AdapterAccount } from "next-auth/adapters"

export const users = pgTable("user", {
    id: text("id").notNull().primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
})

export const accounts = pgTable("account", {
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
},
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
);
//  next-auth's schema ENDs here -------------------


export const TopicsTable = pgTable('topics', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    latestContentDeltaId: uuid('latest_content_delta_id').references(() => ContentDeltasTable.id),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const ContentDeltasTable = pgTable('content_deltas', {
    id: uuid('id').primaryKey().defaultRandom(),
    contentDelta: jsonb('content_delta').notNull(),
    isFullSnapshot: boolean('is_full_snapshot').notNull(),
    previousContentDeltaId: uuid('previous_content_delta_id').references((): AnyPgColumn => ContentDeltasTable.id),
    commitId: uuid('commit_id').references(() => CommitsTable.id).notNull(),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const TopicRelationsTable = pgTable('topic_relations', {
    id: uuid('id').primaryKey().defaultRandom(),
    parentTopicId: uuid('parent_topic_id').references(() => TopicsTable.id),
    siblingTopicIds: uuid('sibling_topic_ids').array().notNull(),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const CommitsTable = pgTable('commits', {
    id: uuid('id').primaryKey().defaultRandom(),
    topicRelationIds: uuid('topic_relation_ids').array().notNull(),
    commitMessage: text('commit_message').notNull(),
    previousCommitId: uuid('previous_commit_id').references((): AnyPgColumn => CommitsTable.id),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const BranchesTable = pgTable('branches', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    topicId: uuid('topic_id').references(() => TopicsTable.id).notNull(),
    latestCommitId: uuid('latest_commit_id').references(() => CommitsTable.id).notNull(),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});
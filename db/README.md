# Refined Database Design Entities and Columns:

1.  **`User`**
    *   `id` (UUID, PK)
    *   `username` (VARCHAR, UNIQUE)
    *   `email` (VARCHAR, UNIQUE)
    *   `created_at` (TIMESTAMPZ)
    *   `updated_at` (TIMESTAMPZ)
    *   *(Other profile fields)*

2.  **`Tag`**
    *   `id` (VARCHAR, PK) - The tag string itself (e.g., 'stem', 'frontend').
    *   `description` (TEXT, nullable)

3.  **`LearningPath`**
    *   `id` (UUID, PK)
    *   `title` (VARCHAR)
    *   `description` (TEXT, nullable)
    *   `created_at` (TIMESTAMPZ)
    *   `updated_at` (TIMESTAMPZ)

4.  **`LearningPathTag`** (Junction Table - *Kept*)
    *   `learning_path_id` (UUID, PK, FK -> `LearningPath.id`)
    *   `tag_id` (VARCHAR, PK, FK -> `Tag.id`)
    *   *(Why : This table is necessary to create the many-to-many relationship between `LearningPath` and `Tag`. Without it, a Learning Path could only link to one Tag, or tags would need to be stored in a less structured way like an array, which breaks standard relational normalization.)*

5.  **`Course`**
    *   `id` (VARCHAR, PK) - e.g., 'calculus-1'.
    *   `title` (VARCHAR)
    *   `description` (TEXT)
    *   `difficulty` (ENUM('beginner', 'intermediate', 'advanced', 'expert'))
    *   `estimated_hours` (INTEGER, nullable)
    *   `created_at` (TIMESTAMPZ)
    *   `updated_at` (TIMESTAMPZ)

6.  **`CourseTag`** (Junction Table - *Kept*)
    *   `course_id` (VARCHAR, PK, FK -> `Course.id`)
    *   `tag_id` (VARCHAR, PK, FK -> `Tag.id`)
    *   *(Why: Similar to `LearningPathTag`, this enables the many-to-many relationship between `Course` and `Tag`, allowing a course to have multiple tags like 'mathematics', 'foundational', 'stem'.)*

7.  **`LearningPathNode`**
    *   `id` (UUID, PK)
    *   `learning_path_id` (UUID, FK -> `LearningPath.id`)
    *   `course_id` (VARCHAR, FK -> `Course.id`)
    *   *(UNIQUE constraint on (`learning_path_id`, `course_id`) recommended)*

8.  **`LearningPathEdge`**
    *   `id` (UUID, PK)
    *   `learning_path_id` (UUID, FK -> `LearningPath.id`)
    *   `source_node_id` (UUID, FK -> `LearningPathNode.id`)
    *   `target_node_id` (UUID, FK -> `LearningPathNode.id`)

9.  **`Branch`**
    *   `id` (UUID, PK)
    *   `course_id` (VARCHAR, FK -> `Course.id`)
    *   `name` (VARCHAR) - e.g., 'main', 'draft/user-uuid-123'.
    *   `is_default` (BOOLEAN, default: false)
    *   `created_by_user_id` (UUID, FK -> `User.id`)
    *   `created_at` (TIMESTAMPZ)
    *   `updated_at` (TIMESTAMPZ)
    *   *(UNIQUE constraint on (`course_id`, `name`))*

10. **`ContentUnit`**
    *   `id` (UUID, PK)
    *   `course_id` (VARCHAR, FK -> `Course.id`)
    *   `created_at` (TIMESTAMPZ)

11. **`TocItem`**
    *   `id` (UUID, PK)
    *   `branch_id` (UUID, FK -> `Branch.id`)
    *   `parent_toc_item_id` (UUID, FK -> `TocItem.id`, nullable)
    *   `content_unit_id` (UUID, FK -> `ContentUnit.id`)
    *   `name` (VARCHAR)
    *   `type` (VARCHAR) - e.g., 'title', 'chapter', 'lesson'.
    *   `order` (SMALLINT)
    *   `created_at` (TIMESTAMPZ)
    *   `updated_at` (TIMESTAMPZ)

12. **`ContentVersion`**
    *   `id` (UUID, PK)
    *   `content_unit_id` (UUID, FK -> `ContentUnit.id`)
    *   `branch_id` (UUID, FK -> `Branch.id`)
    *   `contributor_id` (UUID, FK -> `User.id`)
    *   `approver_id` (UUID, FK -> `User.id`, nullable)
    *   `lexical_state` (JSONB or TEXT)
    *   `commit_message` (TEXT, NOT NULL)
    *   `created_at` (TIMESTAMPZ)

// If you are an LLM, do not implement the tables below
13. **`Feedback`**
    *   `id` (UUID, PK)
    *   `content_version_id` (UUID, FK -> `ContentVersion.id`)
    *   `user_id` (UUID, FK -> `User.id`)
    *   `feedback_type` (ENUM('like', 'dislike', 'comment'))
    *   `comment_text` (VARCHAR(50), nullable)
    *   `created_at` (TIMESTAMPZ)

14. **`ContentBlock`**
    *   `id` (UUID, PK)
    *   `content_unit_id` (UUID, FK -> `ContentUnit.id`)
    *   `block_type` (VARCHAR) - e.g., 'paragraph', 'image', 'custom-quiz'.
    *   `stable_lexical_key` (VARCHAR, nullable) - The stable ID you'll add via node customization. Needs uniqueness constraint within `content_unit_id`.
    *   `created_at` (TIMESTAMPZ)

15. **`BlockContribution`**
    *   `id` (UUID, PK)
    *   `content_block_id` (UUID, FK -> `ContentBlock.id`)
    *   `content_version_id` (UUID, FK -> `ContentVersion.id`)
    *   `contributor_id` (UUID, FK -> `User.id`)
    *   `action_type` (ENUM('add', 'edit', 'delete'))
    *   `contribution_points` (INTEGER, nullable) - Determined by heuristics.
    *   `timestamp` (TIMESTAMPZ)

16. **`EngagementEvent`**
    *   `id` (UUID, PK)
    *   `user_id` (UUID, FK -> `User.id`)
    *   `content_block_id` (UUID, FK -> `ContentBlock.id`)
    *   `content_version_id` (UUID, FK -> `ContentVersion.id`) - Context for which version was engaged with.
    *   `event_type` (VARCHAR) - e.g., 'view', 'like', 'dislike', .
    *   `timestamp` (TIMESTAMPZ)
    *   `duration_ms` (INTEGER, nullable)

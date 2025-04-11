import { db, client } from '../db/drizzle';
import { tags, courses as coursesTable, courseTags } from '../db/schema';
import coursesData from '../lib/courseTopics';
import type { Course, CourseCategoryTag } from '../lib/courseTopics';

async function seedDatabase() {
    console.log('🌱 Starting database seeding...');

    try {
        // 1. Seed Tags
        console.log('🏷️ Extracting and seeding tags...');
        const allTags: Set<CourseCategoryTag> = new Set();
        coursesData.forEach(course => {
            course.tags.forEach(tag => allTags.add(tag));
        });

        const uniqueTagsData = Array.from(allTags).map(tagId => ({
            id: tagId,
            description: null, // Add descriptions later if needed
        }));

        if (uniqueTagsData.length > 0) {
            await db.insert(tags).values(uniqueTagsData).onConflictDoNothing();
            console.log(`✅ Seeded ${uniqueTagsData.length} unique tags.`);
        } else {
            console.log('⚪ No new tags to seed.');
        }

        // 2. Seed Courses
        console.log('📚 Seeding courses...');
        const coursesToInsert = coursesData.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            estimatedHours: course.estimatedHours,
            // createdAt and updatedAt default in schema
        }));

        if (coursesToInsert.length > 0) {
            await db.insert(coursesTable).values(coursesToInsert).onConflictDoNothing();
            console.log(`✅ Seeded ${coursesToInsert.length} courses.`);
        } else {
            console.log('⚪ No new courses to seed.');
        }

        // 3. Seed Course-Tag Relationships
        console.log('🔗 Seeding course-tag relationships...');
        const courseTagRelations: { courseId: string; tagId: CourseCategoryTag }[] = [];
        coursesData.forEach(course => {
            course.tags.forEach(tag => {
                courseTagRelations.push({ courseId: course.id, tagId: tag });
            });
        });

        if (courseTagRelations.length > 0) {
            // Use batching if relation count is very large, but for now, insert directly.
            await db.insert(courseTags).values(courseTagRelations).onConflictDoNothing();
            console.log(`✅ Seeded ${courseTagRelations.length} course-tag relationships.`);
        } else {
            console.log('⚪ No new course-tag relationships to seed.');
        }

        console.log('🏁 Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1); // Exit with error code
    } finally {
        // Drizzle doesn't always require explicit connection closing with neon/serverless
        // If using node-postgres directly, you might need: await db.end();
        console.log('🔌 Closing database connection...');
        await client.end();
        console.log('🔚 Seed script finished.');
    }
}

seedDatabase(); 
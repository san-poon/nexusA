import { cache } from 'react'; // Import React cache
import { db } from '@/core/data/schema/drizzle';
import { courses as coursesTable, courseTags } from '@/core/data/schema/schema';

// Define the type for Course with Tags
export type CourseWithTags = {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimatedHours?: number;
    tags: string[];
};

/**
 * Fetches all courses with their associated tags directly from the database.
 * Wrapped with React.cache for deduplication during server rendering.
 * This function is intended for server-side use.
 */
export const getAllCoursesWithTagsServer = cache(async (): Promise<CourseWithTags[]> => {
    console.log('Fetching all courses with tags from DB...'); // Add log for debugging cache
    try {
        // 1. Fetch all courses
        const courses = await db.select({
            id: coursesTable.id,
            title: coursesTable.title,
            description: coursesTable.description,
            difficulty: coursesTable.difficulty,
            estimatedHours: coursesTable.estimatedHours,
        }).from(coursesTable);

        // 2. Fetch all course-tag relationships
        const courseTagRelations = await db.select({
            courseId: courseTags.courseId,
            tagId: courseTags.tagId,
        }).from(courseTags);

        // 3. Create a map of course IDs to their tags
        const courseTagsMap: Record<string, string[]> = {};
        for (const relation of courseTagRelations) {
            if (!courseTagsMap[relation.courseId]) {
                courseTagsMap[relation.courseId] = [];
            }
            courseTagsMap[relation.courseId].push(relation.tagId);
        }

        // 4. Combine courses with their tags
        const coursesWithTags = courses.map(course => ({
            ...course,
            estimatedHours: course.estimatedHours === null ? undefined : course.estimatedHours,
            tags: courseTagsMap[course.id] || [],
        }));

        return coursesWithTags;
    } catch (error) {
        console.error('Error fetching courses with tags from server:', error);
        // Re-throw the error to let the caller handle it (e.g., show an error page)
        throw new Error('Failed to fetch courses from server');
    }
}); 
import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { courses as coursesTable, courseTags } from '@/db/schema';

export async function GET() {
    try {
        // 1. Fetch all courses
        const courses = await db.select().from(coursesTable);

        // 2. Fetch all course-tag relationships
        const courseTagRelations = await db.select().from(courseTags);

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
            id: course.id,
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            estimatedHours: course.estimatedHours || undefined,
            tags: courseTagsMap[course.id] || [],
        }));

        return NextResponse.json(coursesWithTags);
    } catch (error) {
        console.error('Error fetching courses with tags:', error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
} 
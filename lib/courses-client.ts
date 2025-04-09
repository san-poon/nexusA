import { db } from '@/db/drizzle';
import { courses as coursesTable, tags as tagsTable, courseTags } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type CourseWithTags = {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimatedHours?: number;
    tags: string[];
};

// Cache the courses data
let coursesCache: CourseWithTags[] | null = null;

export async function getAllCoursesWithTags(): Promise<CourseWithTags[]> {
    // Return cached data if available
    if (coursesCache) {
        return coursesCache;
    }

    try {
        // Determine base URL based on environment
        const baseURL = process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_APP_URL // Use NEXT_PUBLIC_APP_URL in production (ensure it's set)
            : 'http://localhost:3000';      // Use localhost for development

        if (!baseURL) {
            throw new Error('Base URL is not defined. Set NEXT_PUBLIC_APP_URL environment variable.');
        }

        const absoluteUrl = new URL('/api/courses', baseURL).toString();
        console.log(`Fetching courses from: ${absoluteUrl}`); // Log the URL for debugging

        const response = await fetch(absoluteUrl); // Use the absolute URL

        if (!response.ok) {
            throw new Error(`Failed to fetch courses: ${response.statusText} (status: ${response.status})`); // Add status code
        }

        const coursesWithTags: CourseWithTags[] = await response.json();

        // Cache the results
        coursesCache = coursesWithTags;

        return coursesWithTags;
    } catch (error) {
        console.error('Error fetching courses with tags:', error);
        // Propagate the error or return empty array depending on desired behavior
        throw error; // Re-throwing might be better for generateStaticParams to fail the build clearly
        // return []; // Or return empty if you want the build to potentially succeed with no courses
    }
}

// Clear the cache (useful for testing or when data changes)
export function clearCoursesCache() {
    coursesCache = null;
} 
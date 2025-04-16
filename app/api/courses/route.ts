import { NextResponse } from 'next/server';

import { getAllCoursesWithTagsServer } from '@/core/data/access/courses';

export async function GET() {
    try {
        // Call the centralized server-side function
        const coursesWithTags = await getAllCoursesWithTagsServer();
        return NextResponse.json(coursesWithTags);
    } catch (error) {

        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
} 
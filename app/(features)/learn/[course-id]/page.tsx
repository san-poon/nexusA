import { getAllCoursesWithTagsServer, CourseWithTags } from "@/data-access/courses";

// Generate static paths for all courses
export async function generateStaticParams() {
    const courses = await getAllCoursesWithTagsServer();
    return courses.map((course: CourseWithTags) => ({
        courseId: course.id,
    }));
}

// Basic placeholder for the dynamic learn page
export default async function LearnCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const resolvedParams = await params;
    const { courseId } = resolvedParams;

    return (
        <div>
            <h1>Learning Course: {courseId}</h1>
        </div>
    );
}
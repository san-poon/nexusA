import { getAllCoursesWithTags } from "@/lib/courses-client";
import ContributeClientLayout from './contribute-client-layout'; // Import the new client component

export async function generateStaticParams() {
  const courses = await getAllCoursesWithTags();
  return courses.map((course) => ({
    courseId: course.id,
  }));
}

// This remains a Server Component
export default async function ContributeCoursePage({ params }: { params: Promise<{ 'course-id': string }> }) {
  const resolvedParams = await params;
  const { 'course-id': courseId } = resolvedParams; // Destructure using the correct key 'course-id'

  // Render the client component, passing props if needed (not needed currently)
  return <ContributeClientLayout /* courseId={courseId} */ />;
}

import { getAllCoursesWithTagsServer, CourseWithTags } from "@/core/data/access/courses";
import ContributeClientLayout from './contribute-client-layout';

export async function generateStaticParams() {
  const courses = await getAllCoursesWithTagsServer();
  return courses.map((course: CourseWithTags) => ({
    'course-id': course.id,
  }));
}

export default async function ContributeCoursePage({ params }: { params: Promise<{ 'course-id': string }> }) {
  const resolvedParams = await params;
  const { 'course-id': courseId } = resolvedParams; // Destructure using the correct key 'course-id'

  // Render the client component, passing props if needed (not needed currently)
  return <ContributeClientLayout /* courseId={courseId} */ />;
}

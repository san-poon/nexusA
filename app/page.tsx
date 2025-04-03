import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Search from '@/app/components/Search';
import Link from 'next/link';

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero section */}
      <div className="flex flex-col items-center py-16 px-6 text-center max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">NexusA: Collaborative Learning Platform</h1>
        <p className="text-xl mb-10 text-neutral-600 dark:text-neutral-400">
          A place where everyone can learn and contribute to high-quality educational content
        </p>

        {/* Search bar */}
        <Search className='z-10 w-full md:w-[32rem] bg-wash-70 dark:bg-wash-750 rounded-full focus-within:shadow-2xl' />
      </div>

      {/* Main features */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 w-full max-w-6xl px-6 mb-16">
        <FeatureCard
          title="Learn"
          description="Access high-quality learning materials created by experts and passionate learners. Every topic has a clear, structured path."
          action={<Link href="/learn" className="px-6 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium">Start Learning</Link>}
        />
        <FeatureCard
          title="Contribute"
          description="Share your knowledge by contributing to existing topics or starting new ones. Every contribution helps others learn better."
          action={<Link href="/create" className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium">Start Contributing</Link>}
        />
      </div>

      {/* Community section */}
      <div className="w-full bg-neutral-50 dark:bg-neutral-900 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Why NexusA is Different</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <ValueProp title="Expert Teamwork" description="Experts collaborate asynchronously to create the best content" />
            <ValueProp title="One Clear Path" description="A single, expert-approved learning path per topic" />
            <ValueProp title="Quality Matters" description="Content validated by experts with continuous improvement" />
            <ValueProp title="Open Access" description="Core learning content is free for everyone" />
          </div>
          <p className="text-lg mb-8">
            NexusA believes that learning should be accessible, clear, and reliable. We're building a community where experts and learners work together to create the best educational content.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 flex flex-col">
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6 flex-grow">{description}</p>
      <div>{action}</div>
    </div>
  );
}

function ValueProp({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4">
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );
}

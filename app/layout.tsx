import type { Metadata } from 'next';
import { defaultFont } from '@/app/fonts';
import { Toaster } from 'sonner';

import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { getAllCoursesWithTagsServer, CourseWithTags } from '@/core/data/access/courses';

export const metadata: Metadata = {
  title: 'nexusA: contribute & learn',
  description: 'collaborate to create high-quality, reliable learning materials and learn from highest quality materials',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const coursesData = await getAllCoursesWithTagsServer();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${defaultFont.className} flex flex-col min-h-screen dark:bg-wash-800 dark:text-neutral-300 text-base tracking-tighter`}>
        <ThemeProvider
          attribute='class'
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header coursesData={coursesData} />
          <main className={`min-h-screen mx-1 md:mx-2 lg:mx-4 tracking-tight`}>
            {children}
          </main>
          <Footer />
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

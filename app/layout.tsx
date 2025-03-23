import type { Metadata } from 'next';
import { defaultFont } from '@/app/fonts';
import { Toaster } from 'sonner';

import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { ThemeProvider } from './components/theme-provider';

export const metadata: Metadata = {
  title: 'Nexus Adept: Collaborate & Master, Together!',
  description: 'Hone your skills with curated learning path designed through collaboration or simply become the collaborator, a master.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${defaultFont.className}  flex flex-col min-h-screen dark:bg-wash-800 dark:text-neutral-100 text-base tracking-tighter`}>
        <ThemeProvider
          attribute='class'
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
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

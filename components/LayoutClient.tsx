'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Dumbbell, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

const inter = Inter({ subsets: ['latin'] });

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [previousBeforeProgress, setPreviousBeforeProgress] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname !== '/activity-log' && pathname !== '/progress-pictures') {
      setPreviousPage(pathname);
      setPreviousBeforeProgress(pathname);
    }
  }, [pathname]);

  const handleToggle = () => {
    if (pathname === '/activity-log') {
      router.push(previousPage || '/');
    } else {
      router.push('/activity-log');
    }
  };

  const handleProgressToggle = () => {
    if (pathname === '/progress-pictures') {
      router.push(previousBeforeProgress || '/');
    } else {
      router.push('/progress-pictures');
    }
  };

  if (!mounted) return null; // prevent hydration mismatch

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className={`min-h-screen flex flex-col text-foreground ${inter.className}`}>
        <div className="header-background flex justify-between items-center px-4 py-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-foreground" onClick={handleProgressToggle}>
              <Camera className="h-6 w-6" />
              <span className="sr-only">
                {pathname === '/progress-pictures' ? 'Back to Previous Page' : 'Progress Pictures'}
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground" onClick={handleToggle}>
              <Dumbbell className="h-6 w-6" />
              <span className="sr-only">
                {pathname === '/activity-log' ? 'Back to Previous Page' : 'Workout Journal'}
              </span>
            </Button>
          </div>
          <ThemeSelector />
        </div>

        <main className="flex-grow pt-14 px-6 sm:px-8 md:px-12">
          <div className="flex-grow">{children}</div>
          <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
            <div>Elephitness LLC.</div>
            <div>&copy; {format(new Date(), 'yyyy')}</div>
          </footer>
        </main>
      </div>
    </ThemeProvider>
  );
}

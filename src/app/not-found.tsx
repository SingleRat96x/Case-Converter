import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-extrabold tracking-tighter text-gray-900 dark:text-gray-50 sm:text-7xl md:text-8xl">
          404
        </h1>
        <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
          Oops! Page Not Found.
        </p>
      </div>
      <p className="max-w-md text-gray-500 dark:text-gray-400">
        It seems like the page you are looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <Link href="/">
        <Button>
          Go back to Homepage
        </Button>
      </Link>
    </div>
  );
} 
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication - AI Content Generator',
  description: 'Login or register for AI Content Generator',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 flex items-center px-4 lg:px-6 border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-lg font-bold">AI Content Generator</span>
        </Link>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} AI Content Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}
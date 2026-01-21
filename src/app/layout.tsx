import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Solidry - AI Code Quality Review',
  description: 'AI-powered code review assistant for SOLID and DRY principles, code hygiene, and quality analysis',
  keywords: ['code review', 'SOLID principles', 'DRY principle', 'code quality', 'AI', 'static analysis'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

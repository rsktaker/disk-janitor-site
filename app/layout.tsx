import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://diskjanitor.com'),
  title: 'Disk Janitor — clean your Mac with AI',
  description:
    'A tiny Mac app that finds the big files, asks AI to explain each in plain English, and lets you trash what you don\'t need. Login data stays untouched.',
  openGraph: {
    title: 'Disk Janitor',
    description: 'A tiny Mac app that finds big files and explains them in plain English.',
    url: 'https://diskjanitor.com',
    siteName: 'Disk Janitor',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen font-[ui-sans-serif,system-ui,-apple-system]">
        {children}
      </body>
    </html>
  );
}

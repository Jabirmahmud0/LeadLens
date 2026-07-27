import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from '../components/providers/PostHogProvider';

export const metadata: Metadata = {
  title: { default: 'LeadLens — Prospect Intelligence for Agencies', template: '%s' },
  description: 'Turn a public business website into a source-backed, agency-specific sales opportunity brief.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: { title: 'LeadLens', description: 'Source-backed prospect intelligence for digital agencies.', type: 'website' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}

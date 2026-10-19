import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Tracker from '@/components/Tracker';

export const metadata: Metadata = {
  title: "RacketHeads Kochi | The Weekend Badminton Community",
  description: "Join Kochi's premier badminton community. Play casual and competitive matches, connect with great players, and elevate your weekend.",
  keywords: ["badminton kochi", "racketheads", "badminton community kochi", "weekend sports kochi"],
  openGraph: {
    title: "RacketHeads Kochi | The Weekend Badminton Community",
    description: "Join Kochi's premier badminton community. Play casual and competitive matches, connect with great players, and elevate your weekend.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
        <Tracker />
      </body>
    </html>
  );
}

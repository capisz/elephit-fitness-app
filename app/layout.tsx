// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import LayoutClient from "@/components/LayoutClient";

export const metadata: Metadata = {
  title: "Elephit | Fitness Tracker",
  description: "Track workouts, nutrition, and progress seamlessly.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}

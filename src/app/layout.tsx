import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "For My Juniors | Career Experiences & Insights",
  description:
    "Community-driven platform where seniors share verified career experiences to help juniors make informed decisions. Explore interview experiences, work insights, and learning journeys.",
  keywords: [
    "career advice",
    "interview experience",
    "placement preparation",
    "work experience",
    "campus placement",
    "tech careers",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

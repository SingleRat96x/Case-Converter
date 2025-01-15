import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";
import { MainLayout } from "./components/layout/MainLayout";
import { HeaderScripts } from "@/components/header-scripts";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Text Case Converter - Free Online Text Case Tools',
    template: '%s | Text Case Converter',
  },
  description: "Free online tools to convert text between different cases. Transform your text to UPPERCASE, lowercase, Title Case, Sentence case, and more.",
  keywords: ["text case converter", "case changer", "text tools", "uppercase converter", "lowercase converter", "title case converter", "sentence case converter"],
  verification: {
    google: "5jTEQc8xGjzILyg6yHlqbWyi93KZleFawCJBiyhVhi0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeaderScripts />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";
import { MainLayout } from "./components/layout/MainLayout";
import { HeaderScripts } from "@/components/header-scripts";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Text Case Converter - Free Online Text Case Tools',
    template: '%s',
  },
  description: "Free online tools to convert text between different cases. Transform your text to UPPERCASE, lowercase, Title Case, Sentence case, and more.",
  keywords: ["text case converter", "case changer", "text tools", "uppercase converter", "lowercase converter", "title case converter", "sentence case converter"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="q0_LZd87Qgf4wjcrK2xldnxXI6G6_4Z8MTfEiWmnctE" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" />
        <Script
          id="grow-me-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTpjNTk3MTVjZS01NmQ1LTQ1MDUtOWIwNC03NDhjYjNhYmEzMjE=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();
            `
          }}
        />
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

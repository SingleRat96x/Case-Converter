import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import { LanguageDetector } from "@/components/LanguageDetector";
import { LanguageHtml } from "@/components/LanguageHtml";
import { ScrollToTop } from "@/components/ScrollToTop";
import { getLocaleFromPathname } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://textcaseconverter.net"),
  title: "Text Case Converter - Professional Text Transformation Tools",
  description: "Transform your text into different cases with ease. Perfect for developers, writers, and content creators. Support for multiple languages including English and Russian.",
  authors: [{ name: "Text Case Converter Team" }],
  creator: "Text Case Converter",
  publisher: "Text Case Converter",
  robots: "index, follow",
  verification: {
    google: "q0_LZd87Qgf4wjcrK2xldnxXI6G6_4Z8MTfEiWmnctE",
    yandex: "a3f802423edf4dae"
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" }
    ]
  },
  openGraph: {
    title: "Text Case Converter - Professional Text Transformation Tools",
    description: "Transform your text into different cases with ease. Perfect for developers, writers, and content creators.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Text Case Converter - Professional Text Transformation Tools",
    description: "Transform your text into different cases with ease. Perfect for developers, writers, and content creators.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detect locale from pathname for server-side rendering
  // The middleware sets x-pathname header with the current path
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const locale = getLocaleFromPathname(pathname);
  
  return (
    <html lang={locale}>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1DT1KPX3XQ"
          strategy="afterInteractive"
        />
        
        {/* AdSense Script - Load early in head */}
        <script 
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8899111851490905"
          crossOrigin="anonymous"
        ></script>
        
        {/* Initialize scripts and AdSense array */}
        <Script id="initialize-scripts" strategy="afterInteractive">
          {`
            // Initialize AdSense array before any components load
            window.adsbygoogle = window.adsbygoogle || [];
            
            // Google Analytics
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1DT1KPX3XQ');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <LanguageHtml>
          <ScrollToTop />
          <LanguageDetector />
          {children}
        </LanguageHtml>
      </body>
    </html>
  );
}

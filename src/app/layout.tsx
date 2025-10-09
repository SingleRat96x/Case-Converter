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
        {/* Critical CSS - Inlined for immediate first paint */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root{--radius:.65rem;--background:oklch(1 0 0);--foreground:oklch(.141 .005 285.823);--primary:oklch(.705 .213 47.604);--primary-foreground:oklch(.98 .016 73.684);--border:oklch(.92 .004 286.32);--muted:oklch(.967 .001 286.375);--muted-foreground:oklch(.552 .016 285.938)}
            .dark{--background:oklch(.141 .005 285.823);--foreground:oklch(.985 0 0);--primary:oklch(.646 .222 41.116);--primary-foreground:oklch(.98 .016 73.684);--border:oklch(1 0 0/10%);--muted:oklch(.274 .006 286.033);--muted-foreground:oklch(.705 .015 286.067)}
            *,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--border)}
            html{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4}
            body{margin:0;font-family:var(--font-geist-sans),system-ui,-apple-system,sans-serif;line-height:inherit;background:var(--background);color:var(--foreground)}
            .min-h-screen{min-height:100vh}.flex{display:flex}.hidden{display:none}.sticky{position:sticky}.top-0{top:0}.z-50{z-index:50}.w-full{width:100%}
            .container{width:100%;max-width:80rem;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem}
            .mx-auto{margin-left:auto;margin-right:auto}.items-center{align-items:center}.justify-between{justify-content:space-between}
            .space-x-4>:not([hidden])~:not([hidden]){margin-left:1rem}.px-4{padding-left:1rem;padding-right:1rem}.h-16{height:4rem}
            .border-b{border-bottom-width:1px}.bg-background\\/95{background-color:color-mix(in oklch,var(--background) 95%,transparent)}.backdrop-blur{backdrop-filter:blur(8px)}
            .text-xl{font-size:1.25rem;line-height:1.75rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}
            .font-bold{font-weight:700}.text-center{text-align:center}.text-foreground{color:var(--foreground)}.text-muted-foreground{color:var(--muted-foreground)}
            .bg-background{background-color:var(--background)}.py-8{padding-top:2rem;padding-bottom:2rem}.mb-6{margin-bottom:1.5rem}
            .space-y-4>:not([hidden])~:not([hidden]){margin-top:1rem}.space-y-6>:not([hidden])~:not([hidden]){margin-top:1.5rem}
            .max-w-4xl{max-width:56rem}.max-w-2xl{max-width:42rem}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
          `
        }} />
        
        {/* Preconnect to third-party domains for faster resource loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        
        {/* Preload critical fonts (Cyrillic subset for Russian pages) */}
        <link 
          rel="preload" 
          href="/_next/static/media/8d697b304b401681-s.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous" 
        />
        
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

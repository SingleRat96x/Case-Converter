import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";
import { MainLayout } from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";

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
  // Retrieve the nonce from the middleware
  const nonce = headers().get('X-Request-Nonce') || ''; 
  // Fallback to empty string if header is not present, though it should be.

  const headersList = headers(); // Get the full Headers object
  const nonceFromHeader = headersList.get('X-Request-Nonce');
  
  console.log("--- In RootLayout (Server Side) ---");
  console.log("Retrieved X-Request-Nonce:", nonceFromHeader);
  console.log("Nonce variable value:", nonce); // This should be the same as nonceFromHeader or '' if null
  
  // Optional: Log all headers to see if X-Request-Nonce is present at all
  console.log("All Request Headers in RootLayout:");
  headersList.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  // Define constants for third-party service IDs from environment variables
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-1DT1KPX3XQ'; // Fallback to existing ID
  const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-8899111851490905'; // Fallback to existing ID

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="q0_LZd87Qgf4wjcrK2xldnxXI6G6_4Z8MTfEiWmnctE" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" />
        
        {/* medshi find me Google AdSense Script */}
        {ADSENSE_CLIENT_ID && (
          <Script
            id="adsense-script"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            nonce={nonce}
            suppressHydrationWarning
          />
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </ThemeProvider>

        {/* medshi find me Google Analytics (gtag.js) */}
        {GA_TRACKING_ID && (
          <>
            {/* Loads the main gtag.js library */}
            <Script
              id="gtag-manager"
              strategy="afterInteractive" // Ensures this loads and defines 'gtag' function
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              nonce={nonce}
              suppressHydrationWarning
            />
            
            {/* Loads our external gtag config script */}
            <Script
              id="gtag-config-external"
              src="/js/gtag-config.js"
              strategy="afterInteractive" // Depends on gtag-manager having loaded
              nonce={nonce}
              suppressHydrationWarning
              data-ga-id={GA_TRACKING_ID} // Pass the tracking ID
            />
          </>
        )}

        {/* medshi find me Grow.me Script */}
        <Script
          id="grow-me-script"
          strategy="lazyOnload"
          src="https://faves.grow.me/main.js" 
          data-grow-faves-site-id="U2l0ZTpjNTk3MTVjZS01NmQ1LTQ1MDUtOWIwNC03NDhjYjNhYmEzMjE="
          nonce={nonce}
          suppressHydrationWarning
        />

        {/*
          medshi find me Placeholder for Future Third-Party Script

          To add a new script:
          1. Get the script URL from the third-party provider.
          2. Add any necessary IDs to your .env.local and process.env.
          3. Use the Next.js <Script> component like the examples above.
          4. Choose an appropriate 'strategy' (e.g., "afterInteractive", "lazyOnload", "beforeInteractive").
          5. Ensure the script's source domain (e.g., some-new-service.com) is added to the
             'script-src' directive in the CSP in src/middleware.ts.
          6. If the script requires other resources (images, styles, connections, frames),
             update the corresponding CSP directives (img-src, style-src, connect-src, frame-src).
          7. Test thoroughly for CSP violations in the browser console.

          <Script
            id="new-third-party-script"
            strategy="lazyOnload" // Example strategy
            src="https://some-new-service.com/script.js"
            nonce={nonce} // Add nonce here too
            // Add any other necessary attributes like data-config-id="YOUR_ID"
          />
        */}
      </body>
    </html>
  );
}

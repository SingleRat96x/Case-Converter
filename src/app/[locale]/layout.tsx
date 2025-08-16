import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "../providers/theme-provider";
import { MainLayout } from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { locales, localeInfo } from '@/i18n/routing';

const inter = Inter({ subsets: ["latin", "cyrillic"] });
const notoSansArabic = Noto_Sans_Arabic({ 
  subsets: ["arabic"],
  variable: '--font-arabic'
});

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: string}
}): Promise<Metadata> {
  const messages = await getMessages({locale});
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return {
    title: {
      default: t('common.appName') + ' - ' + t('common.appDescription'),
      template: '%s',
    },
    description: t('caseConverter.description'),
    keywords: ["text case converter", "case changer", "text tools", "uppercase converter", "lowercase converter", "title case converter", "sentence case converter"],
  };
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Validate the locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Get the direction and font for the locale
  const direction = localeInfo[locale as keyof typeof localeInfo]?.dir || 'ltr';
  const isRTL = direction === 'rtl';
  
  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html 
      lang={locale} 
      dir={direction}
      suppressHydrationWarning
      className={isRTL ? notoSansArabic.variable : ''}
    >
      <head>
        <meta name="google-site-verification" content="q0_LZd87Qgf4wjcrK2xldnxXI6G6_4Z8MTfEiWmnctE" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Google Analytics
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1DT1KPX3XQ');
              
              // Grow.me initialization
              !(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTpjNTk3MTVjZS01NmQ1LTQ1MDUtOWIwNC03NDhjYjNhYmEzMjE=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();
            `
          }}
        />
        
        {/* Google Analytics External Script */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1DT1KPX3XQ"></script>
        
        {/* Google AdSense */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8899111851490905"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${isRTL ? notoSansArabic.className : inter.className} ${isRTL ? 'rtl' : 'ltr'}`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <MainLayout>{children}</MainLayout>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
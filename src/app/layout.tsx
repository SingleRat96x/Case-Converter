import { Inter as FontSans } from 'next/font/google';
import { Fira_Code as FontMono } from 'next/font/google';
import { ThemeProvider } from '@/app/providers/theme-provider';
import './globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'Case Converter - Free Online Text Case Converter Tools',
  description: 'Convert text case online with our free tools. Change to UPPERCASE, lowercase, Title Case, and more. Simple, fast, and free to use.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

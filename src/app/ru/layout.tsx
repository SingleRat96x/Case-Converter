import "../globals.css";
import { LanguageDetector } from "@/components/LanguageDetector";
import { AdSenseProvider } from "@/contexts/AdSenseContext";
import { AdSenseManager } from "@/components/ads/AdSenseManager";

export default function RuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdSenseProvider>
      <AdSenseManager>
        <LanguageDetector />
        {children}
      </AdSenseManager>
    </AdSenseProvider>
  );
}

